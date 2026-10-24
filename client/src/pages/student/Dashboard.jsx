import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { AttendanceDoughnut } from '../../components/charts/AttendanceDoughnut';
import { PerformanceBar } from '../../components/charts/PerformanceBar';

const navItems = [
  { id: 'overview', icon: '◫', label: 'Overview' },
  { id: 'subjects', icon: '▤', label: 'My subjects' },
  { id: 'alerts', icon: '♧', label: 'Academic alerts' },
];

const percent = (value) => `${Math.round(Number(value) || 0)}%`;

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [shareProgress, setShareProgress] = useState(false);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantError, setAssistantError] = useState('');

  useEffect(() => {
    api.get('/api/me/dashboard')
      .then((response) => setData(response.data.data))
      .catch((err) => setError(err.response?.data?.message || 'We could not load your academic dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const subjects = data?.subjects || [];
  const alerts = data?.alerts || [];
  const attended = data?.overall?.attendedSessions || 0;
  const attendanceByStatus = data?.overall?.attendanceByStatus || {
    present: attended,
    late: 0,
    absent: Math.max(0, (data?.overall?.totalSessions || 0) - attended),
  };
  const average = useMemo(() => (
    subjects.length
      ? Math.round(subjects.reduce((sum, subject) => sum + Number(subject.performance?.percentage || 0), 0) / subjects.length)
      : 0
  ), [subjects]);

  async function sendMessage(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || assistantBusy) return;
    setAssistantError('');
    setQuestion('');
    setMessages((current) => [...current, { role: 'student', text }]);
    setAssistantBusy(true);
    try {
      const response = await api.post('/api/me/assistant', { message: text, shareProgress });
      setMessages((current) => [...current, { role: 'assistant', text: response.data.data.reply }]);
    } catch (err) {
      setAssistantError(err.response?.data?.message || 'The study assistant could not respond. Please try again.');
    } finally {
      setAssistantBusy(false);
    }
  }

  function signOut() {
    logout();
    navigate('/login');
  }

  if (loading) {
    return <div className="app-loading"><span className="loading-orbit" />Loading your learning space...</div>;
  }

  if (error || !data) {
    return (
      <div className="app-loading app-error">
        <div className="load-error-card"><span className="brand-mark">E</span><h1>We hit a small bump</h1><p>{error || 'Unable to load your academic profile.'}</p><button className="button button-primary" onClick={signOut}>Return to sign in</button></div>
      </div>
    );
  }

  const name = data.student?.name || user?.name || 'Student';
  const firstName = name.trim().split(/\s+/)[0];
  const sectionLabel = [data.student?.section, data.student?.semester].filter(Boolean).join(' · ');

  return (
    <div className="edu-app">
      <aside className="sidebar">
        <a className="brand-lockup" href="/student" onClick={(event) => { event.preventDefault(); setActiveView('overview'); }}>
          <span className="brand-mark">E</span><span>Edu<span className="brand-accent">Sync</span><small>STUDENT PORTAL</small></span>
        </a>
        <div className="side-section-label">LEARNING SPACE</div>
        <nav className="side-nav" aria-label="Student navigation">
          {navItems.map((item) => (
            <button key={item.id} className={`side-link ${activeView === item.id ? 'side-link-active' : ''}`} onClick={() => setActiveView(item.id)}>
              <span className="side-link-icon">{item.icon}</span><span>{item.label}</span>
              {item.id === 'alerts' && alerts.length > 0 && <span className="nav-count">{alerts.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-coach">
          <span className="coach-sparkle">✳</span>
          <strong>A little guidance goes a long way.</strong>
          <p>Your study coach is ready when you are.</p>
          <button onClick={() => setAssistantOpen(true)}>Ask the study coach <span>↗</span></button>
        </div>
        <div className="sidebar-profile">
          <span className="avatar avatar-lilac">{name.charAt(0).toUpperCase()}</span>
          <span className="profile-copy"><strong>{name}</strong><small>{data.student?.usn || 'Student'}</small></span>
          <button className="signout-button" onClick={signOut} aria-label="Sign out" title="Sign out">↗</button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{navItems.find((item) => item.id === activeView)?.label}</strong></div>
          <div className="topbar-right"><span className="term-chip"><span /> {sectionLabel || 'Academic term'}</span><span className="avatar avatar-lilac avatar-small">{name.charAt(0).toUpperCase()}</span></div>
        </header>

        <div className="page-content">
          {activeView === 'overview' && (
            <>
              <section className="welcome-banner">
                <div><span className="eyebrow">YOUR LEARNING, IN FOCUS</span><h1>Good day, {firstName}<span className="wave-mark">✦</span></h1><p>A clear picture of your progress — and what to focus on next.</p></div>
                <div className="banner-art" aria-hidden="true"><span className="art-sun" /><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-star">✳</span><span className="art-dot" /></div>
                <div className="banner-footer"><span>✦</span> One step at a time. You’re making progress.</div>
              </section>

              <section className="metrics-grid" aria-label="Academic summary">
                <article className="metric-card">
                  <div className="metric-heading"><span>Overall attendance</span><span className="metric-icon icon-purple">◉</span></div>
                  <div className="metric-number">{percent(data.overall?.attendancePct)}</div>
                  <div className="metric-meta"><span className={Number(data.overall?.attendancePct) < 75 ? 'status-text status-warning' : 'status-text'}>{Number(data.overall?.attendancePct) < 75 ? 'Needs attention' : 'On track'}</span><span>{attended} of {data.overall?.totalSessions || 0} classes</span></div>
                  <div className="metric-track"><span className={Number(data.overall?.attendancePct) < 75 ? 'track-warning' : ''} style={{ width: `${Math.min(100, Number(data.overall?.attendancePct) || 0)}%` }} /></div>
                </article>
                <article className="metric-card">
                  <div className="metric-heading"><span>Academic performance</span><span className="metric-icon icon-mint">↗</span></div>
                  <div className="metric-number">{percent(data.overall?.performancePct)}</div>
                  <div className="metric-meta"><span className="status-text">{average >= 75 ? 'Strong momentum' : average >= 50 ? 'Building steadily' : 'Room to grow'}</span><span>Across {subjects.length} subjects</span></div>
                  <div className="metric-track mint-track"><span style={{ width: `${Math.min(100, Number(data.overall?.performancePct) || 0)}%` }} /></div>
                </article>
                <article className="metric-card">
                  <div className="metric-heading"><span>Subjects this term</span><span className="metric-icon icon-peach">▤</span></div>
                  <div className="metric-number">{String(subjects.length).padStart(2, '0')}</div>
                  <div className="metric-meta"><span className="status-text">Your learning lineup</span><span>{data.student?.semester || 'Current term'}</span></div>
                  <button className="metric-link" onClick={() => setActiveView('subjects')}>Explore subjects <span>→</span></button>
                </article>
                <article className="metric-card">
                  <div className="metric-heading"><span>Academic alerts</span><span className="metric-icon icon-yellow">♧</span></div>
                  <div className="metric-number">{String(alerts.length).padStart(2, '0')}</div>
                  <div className="metric-meta"><span className={alerts.length ? 'status-text status-warning' : 'status-text'}>{alerts.length ? 'Worth a closer look' : 'All clear for now'}</span><span>Based on your progress</span></div>
                  <button className="metric-link" onClick={() => setActiveView('alerts')}>View insights <span>→</span></button>
                </article>
              </section>

              <section className="analytics-grid">
                <article className="surface-card chart-card attendance-card">
                  <div className="section-heading"><div><span className="eyebrow">CONSISTENCY COUNTS</span><h2>Attendance overview</h2><p>A little context for your classroom routine.</p></div><span className="period-label">This term</span></div>
                  <div className="attendance-chart"><AttendanceDoughnut present={attendanceByStatus.present} late={attendanceByStatus.late} absent={attendanceByStatus.absent} showLegend={false} /></div>
                  <div className="chart-legend"><span><i className="legend-present" />Present <b>{attendanceByStatus.present}</b></span><span><i className="legend-late" />Late <b>{attendanceByStatus.late}</b></span><span><i className="legend-absent" />Absent <b>{attendanceByStatus.absent}</b></span></div>
                </article>
                <article className="surface-card chart-card performance-card">
                  <div className="section-heading"><div><span className="eyebrow">SMALL WINS ADD UP</span><h2>Subject performance</h2><p>Your published assessment scores at a glance.</p></div><span className="chart-symbol">↗</span></div>
                  {subjects.length ? <PerformanceBar labels={subjects.map((subject) => subject.subjectCode)} scores={subjects.map((subject) => Math.round(Number(subject.performance?.percentage) || 0))} /> : <div className="chart-empty">Published marks will appear here once your faculty shares them.</div>}
                </article>
              </section>

              <section className="content-grid">
                <article className="surface-card subjects-card">
                  <div className="section-heading section-heading-row"><div><span className="eyebrow">YOUR TERM AT A GLANCE</span><h2>My subjects</h2></div><button className="subtle-link" onClick={() => setActiveView('subjects')}>All subjects <span>→</span></button></div>
                  <SubjectTable subjects={subjects.slice(0, 4)} />
                </article>
                <article className="surface-card alerts-card">
                  <div className="section-heading section-heading-row"><div><span className="eyebrow">A GENTLE NUDGE</span><h2>Things to notice</h2></div><span className="alert-count">{alerts.length}</span></div>
                  <AlertList alerts={alerts.slice(0, 3)} />
                  {alerts.length > 3 && <button className="subtle-link alert-more" onClick={() => setActiveView('alerts')}>See all {alerts.length} alerts <span>→</span></button>}
                </article>
              </section>
              <section className="coach-strip"><span className="coach-strip-icon">✳</span><span><strong>A question on your mind?</strong><small>Get a practical, personalized study tip from your academic coach.</small></span><button className="button button-secondary" onClick={() => setAssistantOpen(true)}>Ask a question <span>→</span></button></section>
            </>
          )}

          {activeView === 'subjects' && (
            <section className="view-section">
              <div className="view-intro"><span className="eyebrow">YOUR TERM AT A GLANCE</span><h1>My subjects</h1><p>See how you’re progressing across each course.</p></div>
              <div className="surface-card subjects-card subjects-full"><SubjectTable subjects={subjects} detailed /></div>
            </section>
          )}

          {activeView === 'alerts' && (
            <section className="view-section">
              <div className="view-intro"><span className="eyebrow">SUPPORT, NOT STRESS</span><h1>Academic alerts</h1><p>Helpful signals from your attendance and published results.</p></div>
              <div className="surface-card all-alerts"><AlertList alerts={alerts} /></div>
              {data.remarks?.length > 0 && <article className="surface-card remarks-card"><span className="eyebrow">FROM YOUR FACULTY</span><h2>Faculty notes</h2>{data.remarks.map((remark) => <p className="faculty-remark" key={remark.id}><span className="remark-dot" /> <span><strong>{remark.subjectCode} · {remark.author?.name}</strong><br />{remark.note}</span></p>)}</article>}
            </section>
          )}
        </div>
      </main>

      {assistantOpen && (
        <aside className="assistant-panel" aria-label="Academic support assistant">
          <div className="assistant-header"><span className="assistant-avatar">✳</span><div><strong>EduSync study coach</strong><small>Academic support, grounded in your progress</small></div><button onClick={() => setAssistantOpen(false)} aria-label="Close assistant">×</button></div>
          <div className="assistant-messages" aria-live="polite">
            {messages.length === 0 && <div className="assistant-welcome"><span>✦</span><strong>What would you like help with?</strong><p>Ask about your attendance, a study plan, or how to improve in a subject.</p><div className="suggested-prompts">{['Help me make a study plan', 'How can I improve attendance?'].map((prompt) => <button key={prompt} onClick={() => setQuestion(prompt)}>{prompt} ↗</button>)}</div></div>}
            {messages.map((item, index) => <div className={`chat-bubble chat-${item.role}`} key={`${item.role}-${index}`}>{item.text}</div>)}
            {assistantBusy && <div className="chat-bubble chat-assistant">Thinking through your progress…</div>}
          </div>
          {assistantError && <p className="assistant-error">{assistantError}</p>}
          <form className="assistant-form" onSubmit={sendMessage}><label className="privacy-choice"><input type="checkbox" checked={shareProgress} onChange={(event) => setShareProgress(event.target.checked)} /> Share an anonymous progress snapshot with the configured AI provider for this reply.</label><div className="assistant-input-row"><input aria-label="Message the study coach" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} placeholder="Ask your study coach..." /><button type="submit" disabled={!question.trim() || assistantBusy} aria-label="Send message">↑</button></div><small>Your progress is used only to answer this request. Leave sharing off for local guidance.</small></form>
        </aside>
      )}
      {!assistantOpen && <button className="assistant-launch" onClick={() => setAssistantOpen(true)}><span>✳</span> Study coach</button>}
    </div>
  );
};

function SubjectTable({ subjects, detailed = false }) {
  if (!subjects.length) return <div className="empty-panel"><span>▤</span><strong>No subjects to show yet</strong><p>Your subjects will appear here once your faculty sets up the term.</p></div>;

  return (
    <div className="responsive-table-wrap">
      <table className="edu-table">
        <thead><tr><th>Subject</th><th>Attendance</th><th>Progress</th><th>{detailed ? 'Assessments' : 'Status'}</th></tr></thead>
        <tbody>{subjects.map((subject) => {
          const attendance = Number(subject.attendance?.percentage) || 0;
          const performance = Number(subject.performance?.percentage) || 0;
          return <tr key={subject.offeringId}>
            <td><span className="subject-code">{subject.subjectCode}</span><strong className="subject-title">{subject.subjectName}</strong><small className="subject-faculty">{subject.facultyName}</small></td>
            <td><span className={`table-value ${attendance < 75 ? 'value-warning' : ''}`}>{percent(attendance)}</span><span className="table-subtext">{subject.attendance?.attendedCount || 0}/{subject.attendance?.totalSessions || 0} classes</span><span className="mini-progress"><i style={{ width: `${Math.min(100, attendance)}%` }} /></span></td>
            <td><span className="table-value">{percent(performance)}</span><span className="table-subtext">{subject.performance?.assessmentsCount || 0} published</span><span className="mini-progress progress-purple"><i style={{ width: `${Math.min(100, performance)}%` }} /></span></td>
            <td>{detailed ? <span className="table-subtext">{subject.performance?.assessmentsCount || 0} graded</span> : <span className={`table-status ${attendance < 75 ? 'status-pill-warning' : 'status-pill-good'}`}>{attendance < 75 ? 'Attention' : 'On track'}</span>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  );
}

function AlertList({ alerts }) {
  if (!alerts.length) return <div className="all-clear"><span>✦</span><strong>You’re all caught up</strong><p>No academic alerts right now. Keep showing up and doing your best.</p></div>;

  return <div className="alert-list">{alerts.map((alert, index) => <div className="alert-item" key={`${alert.subjectCode}-${alert.type}-${index}`}><span className={`alert-indicator ${alert.severity === 'CRITICAL' ? 'alert-indicator-urgent' : ''}`}>{alert.severity === 'CRITICAL' ? '!' : 'i'}</span><span className="alert-copy"><strong>{alert.subjectName || alert.subjectCode} <small>{String(alert.type).replaceAll('_', ' ')}</small></strong><p>{alert.message}</p></span></div>)}</div>;
}
