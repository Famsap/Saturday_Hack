const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getStudents = asyncHandler(async (req, res) => {
  const { sectionId } = req.query;
  const where = sectionId ? { sectionId: parseInt(sectionId, 10) } : {};

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      section: true,
    },
    orderBy: { usn: 'asc' },
  });

  res.status(200).json({ success: true, data: students });
});

const getStudentById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid student ID');

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      section: true,
      remarks: {
        include: { author: { select: { id: true, name: true } }, offering: { include: { subject: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!student) throw new ApiError(404, 'Student not found');
  res.status(200).json({ success: true, data: student });
});

const createStudent = asyncHandler(async (req, res) => {
  const { name, email, usn, sectionId } = req.body;
  if (!name || !email || !usn || !sectionId) {
    throw new ApiError(400, 'Name, email, USN, and section ID are required');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(409, 'User with this email already exists');

  const existingStudent = await prisma.student.findUnique({ where: { usn } });
  if (existingStudent) throw new ApiError(409, 'Student with this USN already exists');

  const defaultHash = await bcrypt.hash('Password@123', 10);

  const student = await prisma.student.create({
    data: {
      usn,
      sectionId: parseInt(sectionId, 10),
      user: {
        create: {
          name,
          email,
          passwordHash: defaultHash,
          role: 'STUDENT',
        },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      section: true,
    },
  });

  res.status(201).json({ success: true, data: student });
});

const importStudents = asyncHandler(async (req, res) => {
  const { students: studentList } = req.body;
  if (!Array.isArray(studentList) || studentList.length === 0) {
    throw new ApiError(400, 'Array of students is required for import');
  }

  const defaultHash = await bcrypt.hash('Password@123', 10);
  const results = [];
  const errors = [];

  for (const item of studentList) {
    try {
      const { name, email, usn, sectionId } = item;
      if (!name || !email || !usn || !sectionId) {
        errors.push({ item, error: 'Missing required fields' });
        continue;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      const existingStudent = await prisma.student.findUnique({ where: { usn } });
      if (existingUser || existingStudent) {
        errors.push({ item, error: 'Email or USN already exists' });
        continue;
      }

      const student = await prisma.student.create({
        data: {
          usn,
          sectionId: parseInt(sectionId, 10),
          user: {
            create: { name, email, passwordHash: defaultHash, role: 'STUDENT' },
          },
        },
      });
      results.push(student);
    } catch (err) {
      errors.push({ item, error: err.message });
    }
  }

  res.status(200).json({
    success: true,
    data: { inserted: results.length, errors },
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid student ID');

  const { name, email, usn, sectionId } = req.body;
  const current = await prisma.student.findUnique({ where: { id }, include: { user: true } });
  if (!current) throw new ApiError(404, 'Student not found');

  const updated = await prisma.student.update({
    where: { id },
    data: {
      ...(usn && { usn }),
      ...(sectionId && { sectionId: parseInt(sectionId, 10) }),
      user: {
        update: {
          ...(name && { name }),
          ...(email && { email }),
        },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      section: true,
    },
  });

  res.status(200).json({ success: true, data: updated });
});

const deleteStudent = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError(400, 'Invalid student ID');

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new ApiError(404, 'Student not found');

  await prisma.user.delete({ where: { id: student.userId } });

  res.status(200).json({ success: true, message: 'Student deleted successfully' });
});

const getStudentRemarks = asyncHandler(async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) throw new ApiError(400, 'Invalid student ID');

  const remarks = await prisma.remark.findMany({
    where: { studentId },
    include: {
      author: { select: { id: true, name: true } },
      offering: { include: { subject: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({ success: true, data: remarks });
});

const createStudentRemark = asyncHandler(async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) throw new ApiError(400, 'Invalid student ID');

  const { note, offeringId } = req.body;
  if (!note || !offeringId) {
    throw new ApiError(400, 'Note and offering ID are required');
  }

  const remark = await prisma.remark.create({
    data: {
      studentId,
      offeringId: parseInt(offeringId, 10),
      authorId: req.user.id,
      note,
    },
    include: {
      author: { select: { id: true, name: true } },
      offering: { include: { subject: true } },
    },
  });

  res.status(201).json({ success: true, data: remark });
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  importStudents,
  updateStudent,
  deleteStudent,
  getStudentRemarks,
  createStudentRemark,
};

