import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../api/axiosInstance';

const blankSection = { name: '', semester: '5th Semester', academicYear: '2026-2027' };

export const SectionsTab = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankSection);
  const [saving, setSaving] = useState(false);

  async function fetchSections() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/sections');
      setSections(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sections.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSections(); }, []);

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sections;
    return sections.filter((section) => `${section.name} ${section.semester} ${section.academicYear}`.toLowerCase().includes(term));
  }, [sections, search]);

  function openForm(section = null) {
    setFormOpen(true);
    setEditing(section);
    setForm(section ? { name: section.name, semester: section.semester, academicYear: section.academicYear } : blankSection);
    setError('');
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await api.put(`/api/sections/${editing.id}`, form);
      else await api.post('/api/sections', form);
      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? 'Section details updated.' : 'Section added to this term.');
      await fetchSections();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this section.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSection(section) {
    if (!window.confirm(`Delete ${section.name} · ${section.semester}? Sections with enrolled students cannot be deleted. Any linked subject offerings and their tracking data may also be removed.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/api/sections/${section.id}`);
      setNotice('Section deleted.');
      await fetchSections();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this section. Remove its dependent students or offerings first.');
    }
  }

  return (
    <div className="management-content">
      <div className="management-heading"><div><span className="eyebrow">COHORT ORGANIZATION</span><h2>Academic sections</h2><p>Manage the cohorts, semesters, and academic years in your workspace.</p></div><button className="button button-primary" onClick={() => openForm()}><span>＋</span> Add section</button></div>
      <div className="management-toolbar"><label className="management-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sections..." aria-label="Search sections" /></label><span className="management-result">{filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'}</span></div>
      {error && !editing && <div className="management-alert management-alert-error" role="alert">{error}<button onClick={fetchSections}>Try again</button></div>}
      {notice && !editing && <div className="management-alert management-alert-success" role="status">{notice}</div>}
      {loading ? <div className="management-empty"><span className="loading-orbit" />Loading sections…</div> : !error && (
        <div className="management-table-wrap"><table className="management-table">
          <thead><tr><th>Section</th><th>Semester</th><th>Academic year</th><th>Students</th><th>Offerings</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{filteredSections.map((section) => <tr key={section.id}>
            <td><span className="management-primary">{section.name}</span><span className="management-secondary">Academic cohort</span></td>
            <td>{section.semester}</td><td>{section.academicYear}</td>
            <td><span className="management-count">{section._count?.students ?? 0} learners</span></td>
            <td>{section._count?.offerings ?? 0}</td>
            <td><div className="management-actions"><button onClick={() => openForm(section)} aria-label={`Edit ${section.name}`}>Edit</button><button className="management-delete" onClick={() => deleteSection(section)} aria-label={`Delete ${section.name}`}>Delete</button></div></td>
          </tr>)}</tbody>
        </table>{filteredSections.length === 0 && <div className="management-empty">{sections.length ? 'No sections match your search.' : 'No sections yet. Create the first cohort for your term.'}</div>}</div>
      )}
      {formOpen && <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="section-modal-title"><button className="management-modal-close" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Close dialog">×</button><span className="eyebrow">TERM STRUCTURE</span><h3 id="section-modal-title">{editing ? 'Edit section' : 'Add a section'}</h3><p>Keep your academic cohorts organized and easy to manage.</p>
        {error && <div className="management-alert management-alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="management-form"><label>Section name<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Section B" required /></label><label>Semester<input value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })} placeholder="e.g. 5th Semester" required /></label><label>Academic year<input value={form.academicYear} onChange={(event) => setForm({ ...form, academicYear: event.target.value })} placeholder="e.g. 2026-2027" required /></label><div className="management-modal-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create section'}</button></div></form>
      </section></div>}
    </div>
  );
};
