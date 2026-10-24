import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { OverviewTab } from './subjectHub/OverviewTab';
import { SessionsTab } from './subjectHub/SessionsTab';
import { AssessmentsTab } from './subjectHub/AssessmentsTab';
import { InsightsTab } from './subjectHub/InsightsTab';

export const SubjectHub = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [offering, setOffering] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    async function fetchOfferingData() {
      try {
        setLoading(true);
        setError('');
        const [offeringRes, statsRes] = await Promise.all([
          api.get(`/api/offerings/${id}`),
          api.get(`/api/offerings/${id}/stats`),
        ]);
        if (current) {
          setOffering(offeringRes.data.data);
          setStats(statsRes.data.data);
        }
      } catch (err) {
        if (current) setError(err.response?.data?.message || 'Failed to load subject details.');
      } finally {
        if (current) setLoading(false);
      }
    }
    if (id) fetchOfferingData();
    return () => { current = false; };
  }, [id]);

  if (loading) return <div className="app-loading"><span className="loading-orbit" />Loading your subject workspace…</div>;
  if (error || !offering) {
    return <div className="app-loading app-error"><div className="load-error-card"><span className="brand-mark">E</span><h1>Subject unavailable</h1><p>{error || 'This subject offering could not be found.'}</p><Link className="button button-primary" to="/faculty">Back to your subjects</Link></div></div>;
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '◫' },
    { key: 'sessions', label: 'Sessions', count: stats?.totalSessions ?? 0, icon: '◷' },
    { key: 'assessments', label: 'Assessments', count: stats?.totalAssessments ?? 0, icon: '▤' },
    { key: 'insights', label: 'Insights', count: stats?.atRiskCount || null, icon: '✳' },
  ];

  return (
    <div className="edu-app faculty-app">
      <aside className="sidebar">
        <a className="brand-lockup" href="/faculty" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark">E</span><span>Edu<span className="brand-accent">Sync</span><small>FACULTY PORTAL</small></span>
        </a>
        <div className="side-section-label">TEACHING SPACE</div>
        <nav className="side-nav" aria-label="Faculty navigation">
          <Link className="side-link side-link-active" to="/faculty"><span className="side-link-icon">◫</span>My subjects</Link>
          <Link className="side-link" to="/faculty/setup"><span className="side-link-icon">▦</span>Term setup</Link>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-coach faculty-sidebar-tip"><span className="coach-sparkle">✳</span><strong>Little check-ins go a long way.</strong><p>Keep a pulse on attendance and give students a timely nudge.</p><button onClick={() => setActiveTab('insights')}>Review class insights <span>↗</span></button></div>
        <div className="sidebar-profile"><span className="avatar avatar-lilac">{(offering.faculty?.name || 'F').charAt(0).toUpperCase()}</span><span className="profile-copy"><strong>{offering.faculty?.name || 'Faculty'}</strong><small>Faculty account</small></span></div>
      </aside>

      <main className="main-panel">
        <header className="topbar"><div className="breadcrumb"><Link to="/faculty">My subjects</Link><b>/</b><strong>{offering.subject?.code}</strong></div><div className="topbar-right"><Link className="setup-back-link" to="/faculty/setup">Term setup ↗</Link></div></header>
        <div className="page-content">
          <section className="subject-hero"><div><span className="eyebrow">{offering.section?.academicYear || 'CURRENT TERM'} · {offering.section?.semester || 'SUBJECT WORKSPACE'}</span><div className="subject-hero-title"><span className="subject-code">{offering.subject?.code}</span><h1>{offering.subject?.name}</h1></div><p>{offering.section?.name} <span>·</span> {offering.subject?.credits} credits <span>·</span> {stats?.totalStudents ?? offering.section?.students?.length ?? 0} students</p></div><span className="subject-hero-mark" aria-hidden="true">✳</span></section>

          <nav className="subject-tabs" aria-label="Subject workspace">
            {tabs.map((tab) => (
              <button key={tab.key} className={`subject-tab ${activeTab === tab.key ? 'subject-tab-active' : ''}`} onClick={() => setActiveTab(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}>
                <span>{tab.icon}</span>{tab.label}{tab.count !== undefined && <small className={tab.key === 'insights' && tab.count > 0 ? 'subject-tab-alert' : ''}>{String(tab.count ?? 0).padStart(2, '0')}</small>}
              </button>
            ))}
          </nav>

          <section className="subject-workspace-content">
            {activeTab === 'overview' && <OverviewTab offering={offering} stats={stats} onNavigateTab={setActiveTab} />}
            {activeTab === 'sessions' && <SessionsTab offeringId={id} />}
            {activeTab === 'assessments' && <AssessmentsTab offeringId={id} />}
            {activeTab === 'insights' && <InsightsTab offeringId={id} />}
          </section>
        </div>
      </main>
    </div>
  );
};
