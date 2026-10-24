const config = require('../config');

/**
 * Evaluates alerts for a student in an offering
 * Types:
 * - LOW_ATTENDANCE (CRITICAL if < 65, WARNING if < 75)
 * - LOW_MARKS (< 40%)
 * - DECLINING_TREND (last two assessments each lower than the preceding one)
 */
const generateStudentAlerts = ({ attendancePct, performancePct, marksHistory = [] }) => {
  const alerts = [];

  const { ATTENDANCE_WARN, ATTENDANCE_CRITICAL, MARKS_LOW } = config.THRESHOLDS;

  // 1. Attendance Alerts
  if (attendancePct < ATTENDANCE_CRITICAL) {
    alerts.push({
      type: 'LOW_ATTENDANCE',
      severity: 'CRITICAL',
      message: `Critical attendance level: ${attendancePct}%. Immediate attention required to meet the 75% minimum requirement.`,
    });
  } else if (attendancePct < ATTENDANCE_WARN) {
    alerts.push({
      type: 'LOW_ATTENDANCE',
      severity: 'WARNING',
      message: `Low attendance level: ${attendancePct}%. Below the required threshold of ${ATTENDANCE_WARN}%.`,
    });
  }

  // 2. Marks Alert
  if (performancePct > 0 && performancePct < MARKS_LOW) {
    alerts.push({
      type: 'LOW_MARKS',
      severity: 'WARNING',
      message: `Overall performance is below passing threshold: ${performancePct}%.`,
    });
  }

  // 3. Declining Trend Alert
  // Requires at least 3 assessments with marks to detect two consecutive drops
  const validMarks = marksHistory
    .filter((m) => m.percentage !== undefined && m.percentage !== null)
    .sort((a, b) => new Date(a.conductedOn) - new Date(b.conductedOn));

  if (validMarks.length >= 3) {
    const n = validMarks.length;
    const last = validMarks[n - 1].percentage;
    const prev = validMarks[n - 2].percentage;
    const prevPrev = validMarks[n - 3].percentage;

    if (last < prev && prev < prevPrev) {
      alerts.push({
        type: 'DECLINING_TREND',
        severity: 'WARNING',
        message: `Performance shows a declining trend over the last 3 consecutive assessments (${prevPrev.toFixed(1)}% → ${prev.toFixed(1)}% → ${last.toFixed(1)}%).`,
      });
    }
  }

  return alerts;
};

module.exports = {
  generateStudentAlerts,
};
