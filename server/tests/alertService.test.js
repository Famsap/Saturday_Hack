const { generateStudentAlerts } = require('../src/services/alertService');

describe('alertService', () => {
  it('generates CRITICAL alert when attendance is below 65%', () => {
    const alerts = generateStudentAlerts({
      attendancePct: 60,
      performancePct: 80,
    });
    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'LOW_ATTENDANCE', severity: 'CRITICAL' }),
      ])
    );
  });

  it('generates WARNING alert when attendance is between 65% and 75%', () => {
    const alerts = generateStudentAlerts({
      attendancePct: 70,
      performancePct: 80,
    });
    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'LOW_ATTENDANCE', severity: 'WARNING' }),
      ])
    );
  });

  it('generates LOW_MARKS alert when performance is below 40%', () => {
    const alerts = generateStudentAlerts({
      attendancePct: 80,
      performancePct: 35,
    });
    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'LOW_MARKS', severity: 'WARNING' }),
      ])
    );
  });

  it('generates DECLINING_TREND alert when consecutive assessments decrease', () => {
    const marksHistory = [
      { conductedOn: '2026-01-01', percentage: 90 },
      { conductedOn: '2026-01-10', percentage: 70 },
      { conductedOn: '2026-01-20', percentage: 50 },
    ];
    const alerts = generateStudentAlerts({
      attendancePct: 85,
      performancePct: 70,
      marksHistory,
    });
    expect(alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'DECLINING_TREND', severity: 'WARNING' }),
      ])
    );
  });
});
