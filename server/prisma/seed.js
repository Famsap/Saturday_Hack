const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.remark.deleteMany();
  await prisma.marks.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.offering.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Faculty
  const faculty = await prisma.user.create({
    data: {
      name: 'Dr. Jane Smith',
      email: 'faculty@demo.com',
      passwordHash: defaultPasswordHash,
      role: 'FACULTY',
    },
  });

  // 3. Create Section
  const sectionA = await prisma.section.create({
    data: {
      name: 'Section A',
      semester: 'Sem 5',
      academicYear: '2026-2027',
    },
  });

  // 4. Create Subjects — CS501 to CS505
  const dbms = await prisma.subject.create({
    data: { code: 'CS501', name: 'Database Management Systems', credits: 4 },
  });
  const algorithms = await prisma.subject.create({
    data: { code: 'CS502', name: 'Design and Analysis of Algorithms', credits: 4 },
  });
  const os = await prisma.subject.create({
    data: { code: 'CS503', name: 'Operating Systems', credits: 3 },
  });
  const networks = await prisma.subject.create({
    data: { code: 'CS504', name: 'Computer Networks', credits: 4 },
  });
  const softwareEngineering = await prisma.subject.create({
    data: { code: 'CS505', name: 'Software Engineering', credits: 3 },
  });

  // 5. Create Offerings (Faculty teaching DBMS, CN, and SE in Section A)
  const dbmsOffering = await prisma.offering.create({
    data: { subjectId: dbms.id, sectionId: sectionA.id, facultyId: faculty.id },
  });
  const networksOffering = await prisma.offering.create({
    data: { subjectId: networks.id, sectionId: sectionA.id, facultyId: faculty.id },
  });
  const seOffering = await prisma.offering.create({
    data: { subjectId: softwareEngineering.id, sectionId: sectionA.id, facultyId: faculty.id },
  });

  // 6. Create 10 Students with Users
  const students = [];
  for (let i = 1; i <= 10; i++) {
    const studentUser = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@demo.com`,
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        usn: `1RV24CS${String(i).padStart(3, '0')}`,
        sectionId: sectionA.id,
      },
    });
    students.push(student);
  }

  // 7. Create Class Sessions (2 LOCKED sessions, 1 OPEN)
  const session1 = await prisma.classSession.create({
    data: {
      offeringId: dbmsOffering.id,
      sessionDate: new Date('2026-10-01'),
      period: 1,
      topic: 'Introduction to Relational Databases',
      status: 'LOCKED',
    },
  });

  const session2 = await prisma.classSession.create({
    data: {
      offeringId: dbmsOffering.id,
      sessionDate: new Date('2026-10-03'),
      period: 2,
      topic: 'ER Modeling and Normalization',
      status: 'LOCKED',
    },
  });

  await prisma.classSession.create({
    data: {
      offeringId: dbmsOffering.id,
      sessionDate: new Date('2026-10-05'),
      period: 1,
      topic: 'SQL DDL and DML Basics',
      status: 'OPEN',
    },
  });

  // 8. Record Attendance for the 2 locked sessions
  for (const student of students) {
    // Session 1: All present
    await prisma.attendance.create({
      data: {
        sessionId: session1.id,
        studentId: student.id,
        status: 'PRESENT',
      },
    });

    // Session 2: student 1 & 2 are ABSENT, others PRESENT
    await prisma.attendance.create({
      data: {
        sessionId: session2.id,
        studentId: student.id,
        status: student.id <= students[1].id ? 'ABSENT' : 'PRESENT',
      },
    });
  }

  // 9. Create Assessments: 2 PUBLISHED, 1 DRAFT
  const ia1 = await prisma.assessment.create({
    data: {
      offeringId: dbmsOffering.id,
      title: 'Internal Assessment 1',
      type: 'IA',
      maxMarks: 20,
      conductedOn: new Date('2026-10-10'),
      status: 'PUBLISHED',
    },
  });

  const assignment1 = await prisma.assessment.create({
    data: {
      offeringId: dbmsOffering.id,
      title: 'Assignment 1 - Schema Design',
      type: 'ASSIGNMENT',
      maxMarks: 10,
      conductedOn: new Date('2026-10-15'),
      status: 'PUBLISHED',
    },
  });

  await prisma.assessment.create({
    data: {
      offeringId: dbmsOffering.id,
      title: 'Internal Assessment 2',
      type: 'IA',
      maxMarks: 20,
      conductedOn: new Date('2026-10-25'),
      status: 'DRAFT',
    },
  });

  // 10. Record Marks for published assessments
  for (const student of students) {
    await prisma.marks.create({
      data: {
        assessmentId: ia1.id,
        studentId: student.id,
        marksObtained: student.id === students[0].id ? 8 : 17, // student 1 gets low marks
      },
    });

    await prisma.marks.create({
      data: {
        assessmentId: assignment1.id,
        studentId: student.id,
        marksObtained: 9,
      },
    });
  }

  // 11. Add a demo Remark
  await prisma.remark.create({
    data: {
      studentId: students[0].id,
      offeringId: dbmsOffering.id,
      authorId: faculty.id,
      note: 'Counselled regarding low attendance and IA-1 performance. Needs improvement in upcoming assessments.',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
