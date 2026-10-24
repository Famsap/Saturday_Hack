const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getSessionSheet = asyncHandler(async (req, res) => {
  const sid = parseInt(req.params.sid, 10);
  if (isNaN(sid)) throw new ApiError(400, 'Invalid session ID');

  const session = await prisma.classSession.findUnique({
    where: { id: sid },
    include: {
      offering: {
        include: {
          subject: true,
          section: {
            include: {
              students: {
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { usn: 'asc' },
              },
            },
          },
        },
      },
      attendance: true,
    },
  });

  if (!session) throw new ApiError(404, 'Class session not found');

  const attendanceMap = new Map();
  session.attendance.forEach((att) => {
    attendanceMap.set(att.studentId, att.status);
  });

  const sheet = session.offering.section.students.map((st) => ({
    studentId: st.id,
    usn: st.usn,
    name: st.user.name,
    status: attendanceMap.get(st.id) || 'PRESENT',
  }));

  res.status(200).json({
    success: true,
    data: {
      session: {
        id: session.id,
        offeringId: session.offeringId,
        sessionDate: session.sessionDate,
        period: session.period,
        topic: session.topic,
        status: session.status,
      },
      subject: session.offering.subject,
      section: session.offering.section.name,
      students: sheet,
    },
  });
});

const updateSessionAttendance = asyncHandler(async (req, res) => {
  const sid = parseInt(req.params.sid, 10);
  if (isNaN(sid)) throw new ApiError(400, 'Invalid session ID');

  const session = await prisma.classSession.findUnique({ where: { id: sid } });
  if (!session) throw new ApiError(404, 'Class session not found');

  if (session.status === 'LOCKED') {
    throw new ApiError(400, 'Cannot modify attendance of a locked session. Reopen it first.');
  }

  const records = Array.isArray(req.body) ? req.body : req.body.attendance;
  if (!Array.isArray(records)) {
    throw new ApiError(400, 'Attendance array is required');
  }

  for (const item of records) {
    const studentId = parseInt(item.studentId, 10);
    const status = item.status;

    if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
      throw new ApiError(400, `Invalid attendance status: ${status}`);
    }

    await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: sid,
          studentId,
        },
      },
      update: { status },
      create: {
        sessionId: sid,
        studentId,
        status,
      },
    });
  }

  res.status(200).json({ success: true, message: 'Attendance updated successfully' });
});

const lockSession = asyncHandler(async (req, res) => {
  const sid = parseInt(req.params.sid, 10);
  if (isNaN(sid)) throw new ApiError(400, 'Invalid session ID');

  const session = await prisma.classSession.update({
    where: { id: sid },
    data: { status: 'LOCKED' },
  });

  res.status(200).json({ success: true, message: 'Session locked successfully', data: session });
});

const reopenSession = asyncHandler(async (req, res) => {
  const sid = parseInt(req.params.sid, 10);
  if (isNaN(sid)) throw new ApiError(400, 'Invalid session ID');

  const session = await prisma.classSession.update({
    where: { id: sid },
    data: { status: 'OPEN' },
  });

  res.status(200).json({ success: true, message: 'Session reopened successfully', data: session });
});

module.exports = {
  getSessionSheet,
  updateSessionAttendance,
  lockSession,
  reopenSession,
};
