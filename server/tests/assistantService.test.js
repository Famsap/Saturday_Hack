const { askStudyAssistant, localStudyGuidance } = require('../src/services/assistantService');

const snapshot = {
  attendancePct: 78,
  performancePct: 61,
  subjects: [
    {
      code: 'CS501',
      name: 'Database Management Systems',
      attendance: { percentage: 50, classesNeeded: 10 },
      performance: { percentage: 40, totalMax: 20 },
    },
    {
      code: 'CS504',
      name: 'Computer Networks',
      attendance: { percentage: 90, classesNeeded: 0 },
      performance: { percentage: 82, totalMax: 20 },
    },
  ],
};

describe('assistantService', () => {
  it('gives a subject-specific attendance recommendation from the live academic snapshot', () => {
    const reply = localStudyGuidance('How can I improve my attendance?', snapshot);
    expect(reply).toContain('Database Management Systems (CS501)');
    expect(reply).toContain('10 scheduled classes');
  });

  it('suggests a prioritized study plan using attendance and performance risks', () => {
    const reply = localStudyGuidance('Can you make me a study plan?', snapshot);
    expect(reply).toContain('CS501');
    expect(reply).toContain('CS501 (currently 40%');
  });

  it('rejects empty or oversized messages before reading student data', async () => {
    await expect(askStudyAssistant({ userId: 1, message: ' ' }))
      .rejects.toMatchObject({ statusCode: 400 });
    await expect(askStudyAssistant({ userId: 1, message: 'x'.repeat(601) }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});
