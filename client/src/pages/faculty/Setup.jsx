import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionsTab } from './setup/SectionsTab';
import { SubjectsTab } from './setup/SubjectsTab';
import { OfferingsTab } from './setup/OfferingsTab';
import { StudentsTab } from './setup/StudentsTab';

const tabs = [
  { key: 'sections', label: 'Sections', icon: '▦', description: 'Organize your cohorts' },
  { key: 'subjects', label: 'Subjects', icon: '▤', description: 'Build your course catalog' },
  { key: 'offerings', label: 'Offerings', icon: '◫', description: 'Connect courses to cohorts' },
  { key: 'students', label: 'Students', icon: '♧', description: 'Manage your roster' },
];

export const Setup = () => {
  const [activeTab, setActiveTab] = useState('sections');

  return (
    <div className="edu-app faculty-app">
      <aside className="sidebar">
        <a className="brand-lockup" href="/faculty" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark">E</span><span>Edu<span className="brand-accent">Sync</span><small>FACULTY PORTAL</small></span>
        </a>
        <div className="side-section-label">TEACHING SPACE</div>
        <nav className="side-nav" aria-label="Faculty navigation">
          <Link className="side-link" to="/faculty"><span className="side-link-icon">◫</span>Overview</Link>
          <span className="side-link side-link-active"><span className="side-link-icon">▦</span>Term setup</span>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-coach faculty-sidebar-tip"><span className="coach-sparkle">✳</span><strong>A thoughtful term starts here.</strong><p>Set up your cohorts and courses, then keep every learner in view.</p><Link to="/faculty">Back to overview <span>↗</span></Link></div>
        <div className="sidebar-profile"><span className="avatar avatar-lilac">E</span><span className="profile-copy"><strong>EduSync workspace</strong><small>Academic term setup</small></span></div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Term setup</strong></div>
          <div className="topbar-right"><Link className="setup-back-link" to="/faculty">← Faculty overview</Link></div>
        </header>
        <div className="page-content">
          <section className="setup-intro"><div><span className="eyebrow">GET THE TERM READY</span><h1>Academic term setup</h1><p>Build the structure behind a clear, connected learning experience.</p></div><span className="setup-term-art" aria-hidden="true">✳</span></section>

          <nav className="setup-tabs" aria-label="Academic setup sections">
            {tabs.map((tab, index) => (
              <button key={tab.key} className={`setup-tab ${activeTab === tab.key ? 'setup-tab-active' : ''}`} onClick={() => setActiveTab(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}>
                <span className="setup-tab-number">0{index + 1}</span><span className="setup-tab-icon">{tab.icon}</span><span className="setup-tab-copy"><strong>{tab.label}</strong><small>{tab.description}</small></span><span className="setup-tab-arrow">→</span>
              </button>
            ))}
          </nav>

          <section className="surface-card management-panel">
            {activeTab === 'sections' && <SectionsTab />}
            {activeTab === 'subjects' && <SubjectsTab />}
            {activeTab === 'offerings' && <OfferingsTab />}
            {activeTab === 'students' && <StudentsTab />}
          </section>
          <div className="setup-footer-note"><span>✦</span> Your changes are saved to the academic workspace as you go.</div>
        </div>
      </main>
    </div>
  );
};
