const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateAttendanceStats, calculatePerformanceStats } = require('../services/statsService');
const { generateStudentAlerts } = require('../services/alertService');

const getStudentDashboard = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      section: true,
    },
  });

  if (!student) {
    throw new ApiError(404, 'Student profile not found for this user');
  }

  // Get all offerings for this student's section
  const offerings = await prisma.offering.findMany({
    where: { sectionId: student.sectionId },
    include: {
      subject: true,
      faculty: { select: { id: true, name: true, email: true } },
      sessions: { where: { status: 'LOCKED' } },
      assessments: { where: { status: 'PUBLISHED' } },
    },
  });

  let totalLockedAll = 0;
  let totalAttendedAll = 0;
  let totalMarksObtainedAll = 0;
  let totalMaxMarksAll = 0;

  const subjectStats = [];
  const allAlerts = [];
  const allRemarks = [];

  for (const off of offerings) {
    const lockedCount = off.sessions.length;
    totalLockedAll += lockedCount;

    // Attendance in this offering
    const attRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        session: { offeringId: off.id, status: 'LOCKED' },
      },
    });

    const attStats = calculateAttendanceStats(attRecords, lockedCount);
    totalAttendedAll += attStats.attendedCount;

    // Marks in this offering
    const marksRecords = await prisma.marks.findMany({
      where: {
        studentId: student.id,
        assessment: { offeringId: off.id, status: 'PUBLISHED' },
      },
      include: { assessment: true },
    });

    const perfStats = calculatePerformanceStats(marksRecords);
    totalMarksObtainedAll += perfStats.totalObtained;
    totalMaxMarksAll += perfStats.totalMax;

    // Alerts for this offering
    const alerts = generateStudentAlerts({
      attendancePct: attStats.percentage,
      performancePct: perfStats.percentage,
      marksHistory: perfStats.gradedAssessments,
    });

    alerts.forEach((alert) => {
      allAlerts.push({
        ...alert,
        subjectCode: off.subject.code,
        subjectName: off.subject.name,
      });
    });

    // Remarks for this offering
    const remarks = await prisma.remark.findMany({
      where: { studentId: student.id, offeringId: off.id },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    remarks.forEach((rem) => {
      allRemarks.push({
        ...rem,
        subjectCode: off.subject.code,
        subjectName: off.subject.name,
      });
    });

    subjectStats.push({
      offeringId: off.id,
      subjectCode: off.subject.code,
      subjectName: off.subject.name,
      facultyName: off.faculty.name,
      credits: off.subject.credits,
      attendance: attStats,
      performance: perfStats,
      alerts,
      remarks,
    });
  }

  const overallAttendancePct = totalLockedAll > 0
    ? Math.round((totalAttendedAll / totalLockedAll) * 10000) / 100
    : 100;

  const overallPerformancePct = totalMaxMarksAll > 0
    ? Math.round((totalMarksObtainedAll / totalMaxMarksAll) * 10000) / 100
    : 0;

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student.id,
        usn: student.usn,
        name: student.user.name,
        email: student.user.email,
        section: student.section.name,
        semester: student.section.semester,
      },
      overall: {
        attendancePct: overallAttendancePct,
        performancePct: overallPerformancePct,
        totalSessions: totalLockedAll,
        attendedSessions: totalAttendedAll,
      },
      subjects: subjectStats,
      alerts: allAlerts,
      remarks: allRemarks,
    },
  });
});

module.exports = {
  getStudentDashboard,
};
