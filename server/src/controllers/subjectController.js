const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { code: 'asc' },
    include: {
      _count: {
        select: { offerings: true },
      },
    },
  });

  res.status(200).json({ success: true, data: subjects });
});

const getSubjectById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid subject ID');

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      offerings: {
        include: {
          section: true,
          faculty: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!subject) throw new ApiError(404, 'Subject not found');

  res.status(200).json({ success: true, data: subject });
});

const createSubject = asyncHandler(async (req, res) => {
  const { code, name, credits } = req.body;

  if (!code || !name || credits === undefined) {
    throw new ApiError(400, 'Subject code, name, and credits are required');
  }

  const existing = await prisma.subject.findUnique({
    where: { code },
  });

  if (existing) {
    throw new ApiError(409, 'Subject with this code already exists');
  }

  const subject = await prisma.subject.create({
    data: {
      code,
      name,
      credits: parseInt(credits, 10),
    },
  });

  res.status(201).json({ success: true, data: subject });
});

const updateSubject = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid subject ID');

  const { code, name, credits } = req.body;

  const subject = await prisma.subject.update({
    where: { id },
    data: {
      ...(code && { code }),
      ...(name && { name }),
      ...(credits !== undefined && { credits: parseInt(credits, 10) }),
    },
  });

  res.status(200).json({ success: true, data: subject });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid subject ID');

  await prisma.subject.delete({
    where: { id },
  });

  res.status(200).json({ success: true, message: 'Subject deleted successfully' });
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
