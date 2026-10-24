const prisma = require('../config/prisma');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const { calculateAttendanceStats, calculatePerformanceStats } = require('./statsService');

const getAcademicSnapshot = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { user: { select: { name: true } }, section: true },
  });

  if (!student) throw new ApiError(404, 'Student profile not found for this user');

  const offerings = await prisma.offering.findMany({
    where: { sectionId: student.sectionId },
    include: {
      subject: { select: { code: true, name: true } },
      sessions: { where: { status: 'LOCKED' }, select: { id: true } },
    },
  });

  const subjects = await Promise.all(offerings.map(async (offering) => {
    const [attendanceRecords, marksRecords] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          studentId: student.id,
          session: { offeringId: offering.id, status: 'LOCKED' },
        },
        select: { status: true },
      }),
      prisma.marks.findMany({
        where: {
          studentId: student.id,
          assessment: { offeringId: offering.id, status: 'PUBLISHED' },
        },
        include: { assessment: { select: { title: true, maxMarks: true } } },
      }),
    ]);

    return {
      code: offering.subject.code,
      name: offering.subject.name,
      attendance: calculateAttendanceStats(attendanceRecords, offering.sessions.length),
      performance: calculatePerformanceStats(marksRecords),
    };
  }));

  const totalAttended = subjects.reduce((sum, subject) => sum + subject.attendance.attendedCount, 0);
  const totalSessions = subjects.reduce((sum, subject) => sum + subject.attendance.totalSessions, 0);
  const totalObtained = subjects.reduce((sum, subject) => sum + subject.performance.totalObtained, 0);
  const totalMax = subjects.reduce((sum, subject) => sum + subject.performance.totalMax, 0);

  return {
    attendancePct: totalSessions ? Math.round((totalAttended / totalSessions) * 100) : 100,
    performancePct: totalMax ? Math.round((totalObtained / totalMax) * 100) : 0,
    subjects,
  };
};

const localStudyGuidance = (message, snapshot) => {
  const normalized = message.toLowerCase();
  const attendanceRisk = snapshot.subjects
    .filter((subject) => subject.attendance.percentage < 75)
    .sort((a, b) => a.attendance.percentage - b.attendance.percentage)[0];
  const performanceRisk = snapshot.subjects
    .filter((subject) => subject.performance.totalMax > 0)
    .sort((a, b) => a.performance.percentage - b.performance.percentage)[0];

  if (/attendance|absen|class|classes/.test(normalized) && attendanceRisk) {
    return `${attendanceRisk.name} (${attendanceRisk.code}) is your attendance priority at ${attendanceRisk.attendance.percentage}%. Attend the next ${attendanceRisk.attendance.classesNeeded} scheduled class${attendanceRisk.attendance.classesNeeded === 1 ? '' : 'es'} without a break to reach 75%. Check your faculty's schedule if you are unsure which sessions count.`;
  }
  if (/attendance|absen|class|classes/.test(normalized)) {
    return `Your overall attendance is ${snapshot.attendancePct}%, currently at or above the 75% target. Keep attending every scheduled class; one missed session can quickly affect a subject with fewer completed classes.`;
  }
  if (/plan|study|week|schedule|start|priorit/.test(normalized) && (attendanceRisk || performanceRisk)) {
    const priorities = [];
    if (attendanceRisk) priorities.push(`attend every upcoming ${attendanceRisk.code} class (currently ${attendanceRisk.attendance.percentage}% attendance)`);
    if (performanceRisk) priorities.push(`set aside two focused revision blocks for ${performanceRisk.code} (currently ${performanceRisk.performance.percentage}% in published assessments)`);
    return `A practical plan for this week: ${priorities.join('; ')}. Break each revision block into 25-minute sessions, then review one practice question before you finish.`;
  }
  if (/help|improv|weak|score|mark|grade|perform/.test(normalized) && performanceRisk) {
    return `${performanceRisk.name} (${performanceRisk.code}) is your best opportunity to improve: your current score is ${performanceRisk.performance.percentage}% across published assessments. Review the questions you missed, ask your instructor which concepts to revisit, and try a short practice set before the next assessment.`;
  }
  if (snapshot.subjects.length === 0) {
    return 'Your dashboard does not have any subjects yet. Ask your faculty to check that your section has active subject offerings, then come back and I can help you plan around them.';
  }
  return `You are currently at ${snapshot.attendancePct}% overall attendance and ${snapshot.performancePct}% across published assessment marks. ${attendanceRisk ? `${attendanceRisk.code} needs attention first because attendance is ${attendanceRisk.attendance.percentage}%.` : 'Your attendance is at or above the 75% target.'} Ask me about attendance, study planning, or a subject you want to improve.`;
};

const askStudyAssistant = async ({ userId, message, shareProgress = false }) => {
  if (typeof message !== 'string' || !message.trim() || message.trim().length > 600) {
    throw new ApiError(400, 'Enter a message of 1 to 600 characters');
  }

  const snapshot = await getAcademicSnapshot(userId);
  const context = {
    overallAttendance: snapshot.attendancePct,
    overallPerformance: snapshot.performancePct,
    subjects: snapshot.subjects.map((subject) => ({
      code: subject.code,
      attendance: subject.attendance.percentage,
      classesNeeded: subject.attendance.classesNeeded,
      performance: subject.performance.percentage,
    })),
  };

  if (config.OPENAI_API_KEY && shareProgress === true) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: config.OPENAI_MODEL,
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          {
            role: 'system',
            content: 'You are EduSync, a supportive academic study coach. Give concise, actionable advice grounded only in the provided anonymous progress snapshot. Never infer identity, diagnose, or shame. If asked outside academic support, gently redirect.',
          },
          { role: 'user', content: `Anonymous academic snapshot: ${JSON.stringify(context)}\n\nStudent question: ${message.trim()}` },
        ],
      }),
    });

    if (!response.ok) {
      throw new ApiError(502, 'The AI study assistant is temporarily unavailable. Please try again.');
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new ApiError(502, 'The AI study assistant returned an empty reply. Please try again.');
    return { reply, source: 'ai' };
  }

  return { reply: localStudyGuidance(message.trim(), snapshot), source: 'progress-coach' };
};

module.exports = { askStudyAssistant, localStudyGuidance };
