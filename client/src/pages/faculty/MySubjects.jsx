import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { AttendanceDoughnut } from '../../components/charts/AttendanceDoughnut';

export const MySubjects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/offerings')
      .then((response) => setOfferings(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your subjects.'))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = offerings.reduce((sum, offering) => sum + (offering.section?._count?.students || 0), 0);
  const totalAtRisk = offerings.reduce((sum, offering) => sum + (offering.stats?.atRiskCount || 0), 0);
  const avgAttendance = offerings.length
    ? Math.round(offerings.reduce((sum, offering) => sum + Number(offering.stats?.attendanceAvg || 0), 0) / offerings.length)
    : 0;

  function signOut() {
    logout();
    navigate('/login');
  }

  return (
    <div className="edu-app faculty-app">
      <aside className="sidebar">
        <a className="brand-lockup" href="/faculty" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark">E</span><span>Edu<span className="brand-accent">Sync</span><small>FACULTY PORTAL</small></span>
        </a>
        <div className="side-section-label">TEACHING SPACE</div>
        <nav className="side-nav" aria-label="Faculty navigation">
          <span className="side-link side-link-active"><span className="side-link-icon">◫</span>Overview</span>
          <Link className="side-link" to="/faculty/setup"><span className="side-link-icon">▦</span>Term setup</Link>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-coach faculty-sidebar-tip"><span className="coach-sparkle">✳</span><strong>Every check-in makes a difference.</strong><p>Small, timely interventions help students thrive.</p><Link to="/faculty/setup">Manage your term <span>↗</span></Link></div>
        <div className="sidebar-profile"><span className="avatar avatar-lilac">{(user?.name || 'F').charAt(0).toUpperCase()}</span><span className="profile-copy"><strong>{user?.name || 'Faculty'}</strong><small>Faculty account</small></span><button className="signout-button" onClick={signOut} aria-label="Sign out" title="Sign out">↗</button></div>
      </aside>

      <main className="main-panel">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div><div className="topbar-right"><span className="term-chip"><span /> FACULTY VIEW</span><span className="avatar avatar-lilac avatar-small">{(user?.name || 'F').charAt(0).toUpperCase()}</span></div></header>
        <div className="page-content">
          <section className="welcome-banner faculty-welcome"><div><span className="eyebrow">TEACHING DASHBOARD</span><h1>Welcome back, {(user?.name || 'Faculty').split(/\s+/)[0]}<span className="wave-mark">✦</span></h1><p>Your classes, student progress, and next steps — all in one place.</p></div><div className="banner-art" aria-hidden="true"><span className="art-sun" /><span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" /><span className="art-star">✳</span><span className="art-dot" /></div><div className="banner-footer"><span>✦</span> A thoughtful learning journey starts with a great class.</div></section>
          <section className="metrics-grid faculty-metrics">
            <article className="metric-card"><div className="metric-heading"><span>Active subjects</span><span className="metric-icon icon-purple">▤</span></div><div className="metric-number">{String(offerings.length).padStart(2, '0')}</div><div className="metric-meta"><span className="status-text">Your teaching lineup</span><span>This term</span></div></article>
            <article className="metric-card"><div className="metric-heading"><span>Students reached</span><span className="metric-icon icon-mint">♧</span></div><div className="metric-number">{String(totalStudents).padStart(2, '0')}</div><div className="metric-meta"><span className="status-text">Across your sections</span><span>Enrolled</span></div></article>
            <article className="metric-card"><div className="metric-heading"><span>Average attendance</span><span className="metric-icon icon-peach">◉</span></div><div className="metric-number">{avgAttendance}%</div><div className="metric-meta"><span className={avgAttendance < 75 ? 'status-text status-warning' : 'status-text'}>{avgAttendance < 75 ? 'Room for support' : 'Classes are on track'}</span><span>Across subjects</span></div><div className="metric-track"><span className={avgAttendance < 75 ? 'track-warning' : ''} style={{ width: `${Math.min(100, avgAttendance)}%` }} /></div></article>
            <article className="metric-card"><div className="metric-heading"><span>Students to check in</span><span className="metric-icon icon-yellow">!</span></div><div className="metric-number">{String(totalAtRisk).padStart(2, '0')}</div><div className="metric-meta"><span className={totalAtRisk ? 'status-text status-warning' : 'status-text'}>{totalAtRisk ? 'A timely nudge could help' : 'No urgent flags'}</span><span>At-risk alerts</span></div></article>
          </section>

          <section className="section-heading faculty-list-heading"><div><span className="eyebrow">YOUR TEACHING SPACE</span><h2>My subjects</h2><p>Open a subject to manage attendance, assessments, and insights.</p></div><Link className="button button-primary" to="/faculty/setup"><span>＋</span> Manage term setup</Link></section>

          {loading ? <div className="surface-card loading-card">Loading your subjects…</div> : error ? <div className="surface-card inline-error">{error}</div> : offerings.length === 0 ? <div className="surface-card empty-panel"><span>▤</span><strong>No subjects assigned yet</strong><p>Set up your sections, subjects, students, and offerings to get started.</p><Link className="button button-primary" to="/faculty/setup">Set up your term <span>→</span></Link></div> : (
            <section className="faculty-subject-grid">{offerings.map((offering) => {
              const attendance = Math.round(Number(offering.stats?.attendanceAvg) || 0);
              const students = offering.section?._count?.students || 0;
              return <article className="faculty-subject-card" key={offering.id}>
                <div className="faculty-card-top"><span className="subject-code">{offering.subject?.code}</span><span className="faculty-credits">{offering.subject?.credits} credits</span></div>
                <h3>{offering.subject?.name}</h3><p className="faculty-section">{offering.section?.name} <span>·</span> {offering.section?.semester}</p>
                <div className="faculty-card-data"><div><span className="data-label">ATTENDANCE</span><strong className={attendance < 75 ? 'value-warning' : ''}>{attendance}%</strong></div><div><span className="data-label">STUDENTS</span><strong>{students}</strong></div><div><span className="data-label">NEEDS A CHECK-IN</span><strong className={offering.stats?.atRiskCount ? 'value-warning' : ''}>{offering.stats?.atRiskCount || 0}</strong></div></div>
                <div className="faculty-card-bottom"><span className={`table-status ${offering.stats?.atRiskCount ? 'status-pill-warning' : 'status-pill-good'}`}>{offering.stats?.atRiskCount ? `${offering.stats.atRiskCount} student${offering.stats.atRiskCount === 1 ? '' : 's'} to support` : 'Everyone on track'}</span><Link to={`/faculty/offerings/${offering.id}`}>Open subject <span>→</span></Link></div>
              </article>;
            })}</section>
          )}
          <section className="coach-strip faculty-action-strip"><span className="coach-strip-icon">✳</span><span><strong>Ready to shape the term?</strong><small>Manage sections, students, subject offerings, and your academic setup.</small></span><Link className="button button-secondary" to="/faculty/setup">Open term setup <span>→</span></Link></section>
        </div>
      </main>
    </div>
  );
};
