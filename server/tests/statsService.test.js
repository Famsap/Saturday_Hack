const {
  calculateAttendanceStats,
  calculateClassesNeeded,
  calculatePerformanceStats,
} = require('../src/services/statsService');

describe('statsService', () => {
  describe('calculateAttendanceStats', () => {
    it('returns 100% when there are 0 locked sessions', () => {
      const result = calculateAttendanceStats([], 0);
      expect(result.percentage).toBe(100.0);
      expect(result.classesNeeded).toBe(0);
    });

    it('calculates correct attendance percentage with PRESENT and LATE', () => {
      const records = [
        { status: 'PRESENT' },
        { status: 'LATE' },
        { status: 'ABSENT' },
        { status: 'ABSENT' },
      ];
      const result = calculateAttendanceStats(records, 4);
      expect(result.attendedCount).toBe(2);
      expect(result.percentage).toBe(50.0);
    });
  });

  describe('calculateClassesNeeded', () => {
    it('returns 0 if already at or above target', () => {
      expect(calculateClassesNeeded(8, 10, 75)).toBe(0); // 80% >= 75%
      expect(calculateClassesNeeded(75, 100, 75)).toBe(0);
    });

    it('calculates classes needed accurately', () => {
      // 5 out of 10 = 50%. Target 75%.
      // (5 + X) / (10 + X) >= 0.75 => 5 + X >= 7.5 + 0.75X => 0.25X >= 2.5 => X >= 10
      expect(calculateClassesNeeded(5, 10, 75)).toBe(10);
    });
  });

  describe('calculatePerformanceStats', () => {
    it('ignores absent assessments where marksObtained is null', () => {
      const records = [
        { marksObtained: 15, assessment: { maxMarks: 20, title: 'IA1', conductedOn: '2026-01-01' } },
        { marksObtained: null, assessment: { maxMarks: 20, title: 'IA2', conductedOn: '2026-01-02' } },
      ];
      const result = calculatePerformanceStats(records);
      expect(result.totalObtained).toBe(15);
      expect(result.totalMax).toBe(20);
      expect(result.percentage).toBe(75.0);
      expect(result.assessmentsCount).toBe(1);
    });
  });
});
