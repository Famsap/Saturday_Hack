const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const updateAssessment = asyncHandler(async (req, res) => {
  const aid = parseInt(req.params.aid, 10);
  if (isNaN(aid)) throw new ApiError(400, 'Invalid assessment ID');

  const { title, type, maxMarks, max_marks, conductedOn, conducted_on } = req.body;
  const max = maxMarks || max_marks;
  const date = conductedOn || conducted_on;

  const assessment = await prisma.assessment.update({
    where: { id: aid },
    data: {
      ...(title && { title }),
      ...(type && { type }),
      ...(max !== undefined && { maxMarks: parseFloat(max) }),
      ...(date && { conductedOn: new Date(date) }),
    },
  });

  res.status(200).json({ success: true, data: assessment });
});

const deleteAssessment = asyncHandler(async (req, res) => {
  const aid = parseInt(req.params.aid, 10);
  if (isNaN(aid)) throw new ApiError(400, 'Invalid assessment ID');

  await prisma.assessment.delete({ where: { id: aid } });
  res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
});

const publishAssessment = asyncHandler(async (req, res) => {
  const aid = parseInt(req.params.aid, 10);
  if (isNaN(aid)) throw new ApiError(400, 'Invalid assessment ID');

  const assessment = await prisma.assessment.update({
    where: { id: aid },
    data: { status: 'PUBLISHED' },
  });

  res.status(200).json({ success: true, message: 'Assessment published successfully', data: assessment });
});

const getAssessmentMarks = asyncHandler(async (req, res) => {
  const aid = parseInt(req.params.aid, 10);
  if (isNaN(aid)) throw new ApiError(400, 'Invalid assessment ID');

  const assessment = await prisma.assessment.findUnique({
    where: { id: aid },
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
      marks: true,
    },
  });

  if (!assessment) throw new ApiError(404, 'Assessment not found');

  const marksMap = new Map();
  assessment.marks.forEach((m) => {
    marksMap.set(m.studentId, m.marksObtained !== null ? parseFloat(m.marksObtained) : null);
  });

  const studentMarks = assessment.offering.section.students.map((st) => ({
    studentId: st.id,
    usn: st.usn,
    name: st.user.name,
    marksObtained: marksMap.has(st.id) ? marksMap.get(st.id) : null,
  }));

  res.status(200).json({
    success: true,
    data: {
      assessment: {
        id: assessment.id,
        offeringId: assessment.offeringId,
        title: assessment.title,
        type: assessment.type,
        maxMarks: parseFloat(assessment.maxMarks),
        conductedOn: assessment.conductedOn,
        status: assessment.status,
      },
      students: studentMarks,
    },
  });
});

const updateAssessmentMarks = asyncHandler(async (req, res) => {
  const aid = parseInt(req.params.aid, 10);
  if (isNaN(aid)) throw new ApiError(400, 'Invalid assessment ID');

  const assessment = await prisma.assessment.findUnique({ where: { id: aid } });
  if (!assessment) throw new ApiError(404, 'Assessment not found');

  const records = Array.isArray(req.body) ? req.body : (req.body.marks || req.body.studentMarks);
  if (!Array.isArray(records)) {
    throw new ApiError(400, 'Marks array is required');
  }

  const max = parseFloat(assessment.maxMarks);

  for (const item of records) {
    const studentId = parseInt(item.studentId, 10);
    const marksObtained = item.marksObtained !== null && item.marksObtained !== undefined && item.marksObtained !== ''
      ? parseFloat(item.marksObtained)
      : null;

    if (marksObtained !== null && (marksObtained < 0 || marksObtained > max)) {
      throw new ApiError(400, `Marks obtained must be between 0 and maxMarks (${max})`);
    }

    await prisma.marks.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: aid,
          studentId,
        },
      },
      update: { marksObtained },
      create: {
        assessmentId: aid,
        studentId,
        marksObtained,
      },
    });
  }

  res.status(200).json({ success: true, message: 'Marks updated successfully' });
});

module.exports = {
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  getAssessmentMarks,
  updateAssessmentMarks,
};
