const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getSections = asyncHandler(async (req, res) => {
  const sections = await prisma.section.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { students: true, offerings: true },
      },
    },
  });

  res.status(200).json({ success: true, data: sections });
});

const getSectionById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid section ID');

  const section = await prisma.section.findUnique({
    where: { id },
    include: {
      students: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      offerings: {
        include: {
          subject: true,
          faculty: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!section) throw new ApiError(404, 'Section not found');

  res.status(200).json({ success: true, data: section });
});

const createSection = asyncHandler(async (req, res) => {
  const { name, semester, academicYear, academic_year } = req.body;
  const year = academicYear || academic_year;

  if (!name || !semester || !year) {
    throw new ApiError(400, 'Name, semester, and academic year are required');
  }

  const existing = await prisma.section.findUnique({
    where: {
      name_semester_academicYear: {
        name,
        semester,
        academicYear: year,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, 'Section with this name, semester and academic year already exists');
  }

  const section = await prisma.section.create({
    data: { name, semester, academicYear: year },
  });

  res.status(201).json({ success: true, data: section });
});

const updateSection = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid section ID');

  const { name, semester, academicYear, academic_year } = req.body;
  const year = academicYear || academic_year;

  const section = await prisma.section.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(semester && { semester }),
      ...(year && { academicYear: year }),
    },
  });

  res.status(200).json({ success: true, data: section });
});

const deleteSection = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid section ID');

  await prisma.section.delete({
    where: { id },
  });

  res.status(200).json({ success: true, message: 'Section deleted successfully' });
});

module.exports = {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
};
