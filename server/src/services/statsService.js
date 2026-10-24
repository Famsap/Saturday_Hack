/**
 * Calculates attendance statistics for a student
 * Attendance % = (PRESENT + LATE) / total LOCKED sessions * 100
 */
const calculateAttendanceStats = (attendanceRecords, totalLockedSessions) => {
  if (!totalLockedSessions || totalLockedSessions === 0) {
    return {
      attendedCount: 0,
      totalSessions: 0,
      percentage: 100.0,
      classesNeeded: 0,
    };
  }

  const attendedCount = attendanceRecords.filter(
    (record) => record.status === 'PRESENT' || record.status === 'LATE'
  ).length;

  const percentage = Math.round((attendedCount / totalLockedSessions) * 10000) / 100;

  // Calculate classes needed to reach target percentage (default: 75%)
  const classesNeeded = calculateClassesNeeded(attendedCount, totalLockedSessions, 75);

  return {
    attendedCount,
    totalSessions: totalLockedSessions,
    percentage,
    classesNeeded,
  };
};

/**
 * Formula: (attended + X) / (total + X) >= target / 100
 * => attended + X >= (target/100) * total + (target/100) * X
 * => X * (1 - target/100) >= (target/100) * total - attended
 * => X = ceil( ((target/100) * total - attended) / (1 - target/100) )
 */
const calculateClassesNeeded = (attended, total, targetPercent = 75) => {
  const currentPct = (attended / total) * 100;
  if (currentPct >= targetPercent) return 0;

  const target = targetPercent / 100;
  const needed = Math.ceil((target * total - attended) / (1 - target));
  return Math.max(0, needed);
};

/**
 * Calculates performance % across published assessments
 * Subject performance % = sum(marks_obtained) / sum(max_marks) * 100
 * Only includes assessments where student was not absent (marks_obtained is not null)
 */
const calculatePerformanceStats = (marksRecords) => {
  let totalObtained = 0;
  let totalMax = 0;
  const gradedAssessments = [];

  marksRecords.forEach((record) => {
    if (record.marksObtained !== null && record.marksObtained !== undefined) {
      const obtained = parseFloat(record.marksObtained);
      const max = parseFloat(record.assessment.maxMarks);
      totalObtained += obtained;
      totalMax += max;
      gradedAssessments.push({
        title: record.assessment.title,
        conductedOn: record.assessment.conductedOn,
        marksObtained: obtained,
        maxMarks: max,
        percentage: max > 0 ? (obtained / max) * 100 : 0,
      });
    }
  });

  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;

  return {
    totalObtained,
    totalMax,
    percentage,
    assessmentsCount: gradedAssessments.length,
    gradedAssessments,
  };
};

module.exports = {
  calculateAttendanceStats,
  calculateClassesNeeded,
  calculatePerformanceStats,
};
