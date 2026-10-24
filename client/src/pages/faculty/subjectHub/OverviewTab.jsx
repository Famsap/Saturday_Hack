import React from 'react';

export const OverviewTab = ({ offering, stats, onNavigateTab }) => {
  if (!offering) return null;

  const metrics = [
    {
      label: 'Average attendance',
      value: `${Math.round(Number(stats?.attendanceAvg ?? 100))}%`,
      detail: `${stats?.totalSessions ?? 0} locked class sessions`,
      icon: '◉',
      tone: 'purple',
    },
    {
      label: 'Class performance',
      value: `${Math.round(Number(stats?.performanceAvg ?? 0))}%`,
      detail: `${stats?.totalAssessments ?? 0} published assessments`,
      icon: '↗',
      tone: 'mint',
    },
    {
      label: 'Students to support',
      value: String(stats?.atRiskCount ?? 0).padStart(2, '0'),
      detail: 'Based on attendance and marks',
      icon: '!',
      tone: stats?.atRiskCount ? 'peach' : 'mint',
    },
    {
      label: 'Class strength',
      value: String(stats?.totalStudents ?? offering.section?.students?.length ?? 0).padStart(2, '0'),
      detail: `Enrolled in ${offering.section?.name || 'this section'}`,
      icon: '♧',
      tone: 'yellow',
    },
  ];

  return (
    <div className="hub-overview">
      <div className="hub-metrics">
        {metrics.map((metric) => <article className="hub-stat-card" key={metric.label}>
          <div className="hub-stat-top"><span>{metric.label}</span><span className={`hub-stat-icon hub-icon-${metric.tone}`}>{metric.icon}</span></div>
          <strong>{metric.value}</strong><small>{metric.detail}</small>
        </article>)}
      </div>
      <article className="hub-detail-card">
        <div className="hub-detail-heading"><div><span className="eyebrow">COURSE DETAILS</span><h2>A clear view of your class.</h2><p>Everything you need to keep this subject moving forward.</p></div><span className="hub-detail-illustration">✳</span></div>
        <div className="hub-facts">
          <div><span>SUBJECT CODE</span><strong>{offering.subject?.code || '—'}</strong></div>
          <div><span>SECTION</span><strong>{offering.section?.name || '—'} · {offering.section?.semester || '—'}</strong></div>
          <div><span>ACADEMIC YEAR</span><strong>{offering.section?.academicYear || '—'}</strong></div>
          <div><span>COURSE CREDITS</span><strong>{offering.subject?.credits ?? '—'} credits</strong></div>
        </div>
      </article>
      <div className="hub-quick-actions">
        <button className="hub-action-card action-purple" onClick={() => onNavigateTab('sessions')}><span className="hub-action-icon">◷</span><span><strong>Take attendance</strong><small>Record a class session</small></span><span className="hub-action-arrow">→</span></button>
        <button className="hub-action-card action-mint" onClick={() => onNavigateTab('assessments')}><span className="hub-action-icon">▤</span><span><strong>Manage assessments</strong><small>Enter marks and publish results</small></span><span className="hub-action-arrow">→</span></button>
        <button className="hub-action-card action-peach" onClick={() => onNavigateTab('insights')}><span className="hub-action-icon">✳</span><span><strong>Review class insights</strong><small>{stats?.atRiskCount ? `${stats.atRiskCount} learners may need support` : 'Check class progress'}</small></span><span className="hub-action-arrow">→</span></button>
      </div>
    </div>
  );
};
