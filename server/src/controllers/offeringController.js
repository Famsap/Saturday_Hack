const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateAttendanceStats, calculatePerformanceStats } = require('../services/statsService');
const { generateStudentAlerts } = require('../services/alertService');

const getOfferings = asyncHandler(async (req, res) => {
  const where = req.user.role === 'FACULTY' ? { facultyId: req.user.id } : {};

  const offerings = await prisma.offering.findMany({
    where,
    include: {
      subject: true,
      section: {
        include: {
          _count: { select: { students: true } },
        },
      },
      sessions: {
        where: { status: 'LOCKED' },
        select: { id: true },
      },
      assessments: {
        where: { status: 'PUBLISHED' },
        select: { id: true },
      },
    },
    orderBy: { id: 'desc' },
  });

  const offeringsWithStats = await Promise.all(
    offerings.map(async (offering) => {
      const totalLocked = offering.sessions.length;
      const totalStudents = offering.section._count.students;
      let atRiskCount = 0;
      let totalAttendanceRate = 0;

      if (totalStudents > 0 && totalLocked > 0) {
        const attendance = await prisma.attendance.findMany({
          where: { session: { offeringId: offering.id, status: 'LOCKED' } },
        });

        const studentAttendance = {};
        attendance.forEach((att) => {
          if (!studentAttendance[att.studentId]) studentAttendance[att.studentId] = [];
          studentAttendance[att.studentId].push(att);
        });

        let counted = 0;
        for (const sId in studentAttendance) {
          const stats = calculateAttendanceStats(studentAttendance[sId], totalLocked);
          totalAttendanceRate += stats.percentage;
          counted++;
          if (stats.percentage < 75) atRiskCount++;
        }

        const attendanceAvg = counted > 0 ? Math.round((totalAttendanceRate / counted) * 10) / 10 : 100;
        return {
          ...offering,
          stats: { attendanceAvg, atRiskCount, totalStudents, totalSessions: totalLocked },
        };
      }

      return {
        ...offering,
        stats: { attendanceAvg: 100, atRiskCount: 0, totalStudents, totalSessions: totalLocked },
      };
    })
  );

  res.status(200).json({ success: true, data: offeringsWithStats });
});

const getOfferingById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  const offering = await prisma.offering.findUnique({
    where: { id },
    include: {
      subject: true,
      section: {
        include: {
          students: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
      faculty: { select: { id: true, name: true, email: true } },
      sessions: { orderBy: { sessionDate: 'desc' } },
      assessments: { orderBy: { conductedOn: 'desc' } },
    },
  });

  if (!offering) throw new ApiError(404, 'Offering not found');
  res.status(200).json({ success: true, data: offering });
});

const createOffering = asyncHandler(async (req, res) => {
  const { subjectId, sectionId } = req.body;
  if (!subjectId || !sectionId) {
    throw new ApiError(400, 'Subject ID and Section ID are required');
  }

  const sId = parseInt(subjectId, 10);
  const secId = parseInt(sectionId, 10);

  const existing = await prisma.offering.findUnique({
    where: { subjectId_sectionId: { subjectId: sId, sectionId: secId } },
  });

  if (existing) throw new ApiError(409, 'An offering for this subject and section already exists');

  const offering = await prisma.offering.create({
    data: { subjectId: sId, sectionId: secId, facultyId: req.user.id },
    include: { subject: true, section: true },
  });

  res.status(201).json({ success: true, data: offering });
});

const updateOffering = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  const { subjectId, sectionId } = req.body;
  const offering = await prisma.offering.update({
    where: { id },
    data: {
      ...(subjectId && { subjectId: parseInt(subjectId, 10) }),
      ...(sectionId && { sectionId: parseInt(sectionId, 10) }),
    },
    include: { subject: true, section: true },
  });

  res.status(200).json({ success: true, data: offering });
});

const deleteOffering = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  await prisma.offering.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Offering deleted successfully' });
});

const getOfferingSessions = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  const sessions = await prisma.classSession.findMany({
    where: { offeringId: id },
    orderBy: [{ sessionDate: 'desc' }, { period: 'asc' }],
    include: { _count: { select: { attendance: true } } },
  });

  res.status(200).json({ success: true, data: sessions });
});

const createOfferingSession = asyncHandler(async (req, res) => {
  const offeringId = parseInt(req.params.id, 10);
  if (isNaN(offeringId)) throw new ApiError(400, 'Invalid offering ID');

  const { date, sessionDate, period, topic } = req.body;
  const sDate = sessionDate || date;
  if (!sDate || period === undefined) {
    throw new ApiError(400, 'Session date and period are required');
  }

  const offering = await prisma.offering.findUnique({
    where: { id: offeringId },
    include: { section: { include: { students: true } } },
  });

  if (!offering) throw new ApiError(404, 'Offering not found');

  const parsedDate = new Date(sDate);
  const parsedPeriod = parseInt(period, 10);

  const existing = await prisma.classSession.findUnique({
    where: {
      offeringId_sessionDate_period: {
        offeringId,
        sessionDate: parsedDate,
        period: parsedPeriod,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, 'A session for this date and period already exists');
  }

  const session = await prisma.classSession.create({
    data: {
      offeringId,
      sessionDate: parsedDate,
      period: parsedPeriod,
      topic: topic || null,
      status: 'OPEN',
      attendance: {
        create: offering.section.students.map((student) => ({
          studentId: student.id,
          status: 'PRESENT',
        })),
      },
    },
    include: { attendance: true },
  });

  res.status(201).json({ success: true, data: session });
});

const getOfferingAssessments = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  const assessments = await prisma.assessment.findMany({
    where: { offeringId: id },
    orderBy: { conductedOn: 'desc' },
    include: { _count: { select: { marks: true } } },
  });

  res.status(200).json({ success: true, data: assessments });
});

const createOfferingAssessment = asyncHandler(async (req, res) => {
  const offeringId = parseInt(req.params.id, 10);
  if (isNaN(offeringId)) throw new ApiError(400, 'Invalid offering ID');

  const { title, type, maxMarks, max_marks, conductedOn, conducted_on } = req.body;
  const max = maxMarks || max_marks;
  const date = conductedOn || conducted_on;

  if (!title || !type || max === undefined || !date) {
    throw new ApiError(400, 'Title, type, max marks, and date are required');
  }

  const assessment = await prisma.assessment.create({
    data: {
      offeringId,
      title,
      type,
      maxMarks: parseFloat(max),
      conductedOn: new Date(date),
      status: 'DRAFT',
    },
  });

  res.status(201).json({ success: true, data: assessment });
});

const getOfferingStats = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  const offering = await prisma.offering.findUnique({
    where: { id },
    include: {
      section: { include: { students: { include: { user: { select: { name: true } } } } } },
      sessions: { where: { status: 'LOCKED' } },
      assessments: { where: { status: 'PUBLISHED' } },
    },
  });

  if (!offering) throw new ApiError(404, 'Offering not found');

  const totalLocked = offering.sessions.length;
  const students = offering.section.students;

  if (students.length === 0) {
    return res.status(200).json({
      success: true,
      data: { attendanceAvg: 100, performanceAvg: 0, atRiskCount: 0, totalStudents: 0, totalSessions: totalLocked },
    });
  }

  let totalAttPct = 0;
  let totalPerfPct = 0;
  let studentsWithMarks = 0;
  let atRiskCount = 0;

  for (const student of students) {
    const studentAttendance = await prisma.attendance.findMany({
      where: { studentId: student.id, session: { offeringId: id, status: 'LOCKED' } },
    });
    const attStats = calculateAttendanceStats(studentAttendance, totalLocked);
    totalAttPct += attStats.percentage;

    const studentMarks = await prisma.marks.findMany({
      where: { studentId: student.id, assessment: { offeringId: id, status: 'PUBLISHED' } },
      include: { assessment: true },
    });
    const perfStats = calculatePerformanceStats(studentMarks);
    if (perfStats.assessmentsCount > 0) {
      totalPerfPct += perfStats.percentage;
      studentsWithMarks++;
    }

    const alerts = generateStudentAlerts({
      attendancePct: attStats.percentage,
      performancePct: perfStats.percentage,
      marksHistory: perfStats.gradedAssessments,
    });
    if (alerts.length > 0) atRiskCount++;
  }

  const attendanceAvg = Math.round((totalAttPct / students.length) * 10) / 10;
  const performanceAvg = studentsWithMarks > 0 ? Math.round((totalPerfPct / studentsWithMarks) * 10) / 10 : 0;

  res.status(200).json({
    success: true,
    data: {
      attendanceAvg,
      performanceAvg,
      atRiskCount,
      totalStudents: students.length,
      totalSessions: totalLocked,
      totalAssessments: offering.assessments.length,
    },
  });
});

const getOfferingAtRisk = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid offering ID');

  const offering = await prisma.offering.findUnique({
    where: { id },
    include: {
      section: {
        include: {
          students: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      },
      sessions: { where: { status: 'LOCKED' } },
    },
  });

  if (!offering) throw new ApiError(404, 'Offering not found');

  const totalLocked = offering.sessions.length;
  const students = offering.section.students;
  const atRiskList = [];

  for (const student of students) {
    const studentAttendance = await prisma.attendance.findMany({
      where: { studentId: student.id, session: { offeringId: id, status: 'LOCKED' } },
    });
    const attStats = calculateAttendanceStats(studentAttendance, totalLocked);

    const studentMarks = await prisma.marks.findMany({
      where: { studentId: student.id, assessment: { offeringId: id, status: 'PUBLISHED' } },
      include: { assessment: true },
    });
    const perfStats = calculatePerformanceStats(studentMarks);

    const alerts = generateStudentAlerts({
      attendancePct: attStats.percentage,
      performancePct: perfStats.percentage,
      marksHistory: perfStats.gradedAssessments,
    });

    const remarks = await prisma.remark.findMany({
      where: { studentId: student.id, offeringId: id },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (alerts.length > 0 || remarks.length > 0) {
      atRiskList.push({
        student: {
          id: student.id,
          usn: student.usn,
          name: student.user.name,
          email: student.user.email,
        },
        attendancePct: attStats.percentage,
        classesNeeded: attStats.classesNeeded,
        performancePct: perfStats.percentage,
        alerts,
        remarks,
      });
    }
  }

  res.status(200).json({ success: true, data: atRiskList });
});

module.exports = {
  getOfferings,
  getOfferingById,
  createOffering,
  updateOffering,
  deleteOffering,
  getOfferingSessions,
  createOfferingSession,
  getOfferingAssessments,
  createOfferingAssessment,
  getOfferingStats,
  getOfferingAtRisk,
};


