import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axiosInstance';

export const OfferingsTab = () => {
  const [offerings, setOfferings] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      setError('');
      const [offeringResponse, sectionResponse, subjectResponse] = await Promise.all([
        api.get('/api/offerings'),
        api.get('/api/sections'),
        api.get('/api/subjects'),
      ]);
      setOfferings(offeringResponse.data.data || []);
      setSections(sectionResponse.data.data || []);
      setSubjects(subjectResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load offering data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const filteredOfferings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? offerings.filter((offering) => `${offering.subject?.code} ${offering.subject?.name} ${offering.section?.name} ${offering.section?.semester}`.toLowerCase().includes(term)) : offerings;
  }, [offerings, search]);

  function openForm(offering = null) {
    setFormOpen(true);
    setEditing(offering);
    setSelectedSubjectId(String(offering?.subjectId ?? subjects[0]?.id ?? ''));
    setSelectedSectionId(String(offering?.sectionId ?? sections[0]?.id ?? ''));
    setError('');
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedSubjectId || !selectedSectionId) return;
    setSaving(true);
    setError('');
    try {
      const payload = { subjectId: Number(selectedSubjectId), sectionId: Number(selectedSectionId) };
      if (editing) await api.put(`/api/offerings/${editing.id}`, payload);
      else await api.post('/api/offerings', payload);
      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? 'Subject offering updated.' : 'Subject assigned to the selected section.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this offering.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteOffering(offering) {
    if (!window.confirm(`Remove ${offering.subject?.code} from ${offering.section?.name}? Its sessions and assessments will also be removed.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/api/offerings/${offering.id}`);
      setNotice('Offering removed from this term.');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove this offering.');
    }
  }

  return (
    <div className="management-content">
      <div className="management-heading"><div><span className="eyebrow">TEACHING ASSIGNMENTS</span><h2>Subject offerings</h2><p>Pair courses with cohorts to bring your term plan to life.</p></div><button className="button button-primary" onClick={() => openForm()} disabled={!subjects.length || !sections.length}><span>＋</span> Create offering</button></div>
      <div className="management-toolbar"><label className="management-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subjects or sections..." aria-label="Search offerings" /></label><span className="management-result">{filteredOfferings.length} {filteredOfferings.length === 1 ? 'offering' : 'offerings'}</span></div>
      {error && !formOpen && <div className="management-alert management-alert-error" role="alert">{error}<button onClick={fetchData}>Try again</button></div>}
      {notice && !formOpen && <div className="management-alert management-alert-success" role="status">{notice}</div>}
      {!loading && (!subjects.length || !sections.length) && <div className="management-alert management-alert-info">Create at least one subject and one section before assigning an offering.</div>}
      {loading ? <div className="management-empty"><span className="loading-orbit" />Loading offerings…</div> : !error && <div className="management-table-wrap"><table className="management-table">
        <thead><tr><th>Subject</th><th>Section</th><th>Students</th><th>Attendance</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{filteredOfferings.map((offering) => <tr key={offering.id}>
          <td><span className="subject-code">{offering.subject?.code}</span><span className="management-primary management-subject-name">{offering.subject?.name}</span></td>
          <td><span className="management-primary">{offering.section?.name}</span><span className="management-secondary">{offering.section?.semester} · {offering.section?.academicYear}</span></td>
          <td><span className="management-count">{offering.section?._count?.students ?? offering.stats?.totalStudents ?? 0} learners</span></td>
          <td><span className={`management-count ${Number(offering.stats?.attendanceAvg) < 75 ? 'management-count-warn' : ''}`}>{Math.round(Number(offering.stats?.attendanceAvg) || 0)}%</span></td>
          <td><div className="management-actions"><Link to={`/faculty/offerings/${offering.id}`}>Open</Link><button onClick={() => openForm(offering)} aria-label={`Edit ${offering.subject?.code} offering`}>Edit</button><button className="management-delete" onClick={() => deleteOffering(offering)} aria-label={`Delete ${offering.subject?.code} offering`}>Delete</button></div></td>
        </tr>)}</tbody>
      </table>{filteredOfferings.length === 0 && <div className="management-empty">{offerings.length ? 'No offerings match your search.' : 'No subject offerings yet. Assign a course to a section to get started.'}</div>}</div>}
      {formOpen && <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="offering-modal-title"><button className="management-modal-close" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Close dialog">×</button><span className="eyebrow">TEACHING ASSIGNMENT</span><h3 id="offering-modal-title">{editing ? 'Edit offering' : 'Create an offering'}</h3><p>Choose the course and cohort for this subject workspace.</p>
        {error && <div className="management-alert management-alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="management-form"><label>Subject<select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} required><option value="" disabled>Select a subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>)}</select></label><label>Section<select value={selectedSectionId} onChange={(event) => setSelectedSectionId(event.target.value)} required><option value="" disabled>Select a section</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name} · {section.semester}</option>)}</select></label><div className="management-modal-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving || !subjects.length || !sections.length}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create offering'}</button></div></form>
      </section></div>}
    </div>
  );
};
