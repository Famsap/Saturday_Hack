import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../api/axiosInstance';

const blankSubject = { code: '', name: '', credits: 4 };

export const SubjectsTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankSubject);
  const [saving, setSaving] = useState(false);

  async function fetchSubjects() {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/subjects');
      setSubjects(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSubjects(); }, []);

  const filteredSubjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? subjects.filter((subject) => `${subject.code} ${subject.name}`.toLowerCase().includes(term)) : subjects;
  }, [subjects, search]);

  function openForm(subject = null) {
    setFormOpen(true);
    setEditing(subject);
    setForm(subject ? { code: subject.code, name: subject.name, credits: subject.credits } : blankSubject);
    setError('');
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, code: form.code.trim().toUpperCase(), name: form.name.trim(), credits: Number(form.credits) };
    try {
      if (editing) await api.put(`/api/subjects/${editing.id}`, payload);
      else await api.post('/api/subjects', payload);
      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? 'Subject details updated.' : 'Subject added to your course catalog.');
      await fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this subject.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSubject(subject) {
    if (!window.confirm(`Delete ${subject.code} · ${subject.name}? This will also delete its offerings, class sessions, assessments, and recorded marks.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/api/subjects/${subject.id}`);
      setNotice('Subject deleted.');
      await fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this subject. Remove its offerings first.');
    }
  }

  return (
    <div className="management-content">
      <div className="management-heading"><div><span className="eyebrow">COURSE CATALOG</span><h2>Department subjects</h2><p>Manage course codes, descriptions, and credit values for your term.</p></div><button className="button button-primary" onClick={() => openForm()}><span>＋</span> Add subject</button></div>
      <div className="management-toolbar"><label className="management-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by course name or code..." aria-label="Search subjects" /></label><span className="management-result">{filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}</span></div>
      {error && !formOpen && <div className="management-alert management-alert-error" role="alert">{error}<button onClick={fetchSubjects}>Try again</button></div>}
      {notice && !formOpen && <div className="management-alert management-alert-success" role="status">{notice}</div>}
      {loading ? <div className="management-empty"><span className="loading-orbit" />Loading subjects…</div> : !error && <div className="management-table-wrap"><table className="management-table">
        <thead><tr><th>Course</th><th>Credits</th><th>Active offerings</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{filteredSubjects.map((subject) => <tr key={subject.id}>
          <td><span className="subject-code">{subject.code}</span><span className="management-primary management-subject-name">{subject.name}</span></td>
          <td><span className="management-count">{subject.credits} credits</span></td><td>{subject._count?.offerings ?? 0}</td>
          <td><div className="management-actions"><button onClick={() => openForm(subject)} aria-label={`Edit ${subject.code}`}>Edit</button><button className="management-delete" onClick={() => deleteSubject(subject)} aria-label={`Delete ${subject.code}`}>Delete</button></div></td>
        </tr>)}</tbody>
      </table>{filteredSubjects.length === 0 && <div className="management-empty">{subjects.length ? 'No subjects match your search.' : 'Your course catalog is empty. Add a subject to get started.'}</div>}</div>}
      {formOpen && <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="subject-modal-title"><button className="management-modal-close" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Close dialog">×</button><span className="eyebrow">COURSE CATALOG</span><h3 id="subject-modal-title">{editing ? 'Edit subject' : 'Add a subject'}</h3><p>Give your course a clear name and code students can recognize.</p>
        {error && <div className="management-alert management-alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="management-form"><label>Course code<input autoFocus value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="e.g. CS506" maxLength={20} required /></label><label>Subject name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Machine Learning" maxLength={100} required /></label><label>Credits<input type="number" min="1" max="10" value={form.credits} onChange={(event) => setForm({ ...form, credits: event.target.value })} required /></label><div className="management-modal-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add subject'}</button></div></form>
      </section></div>}
    </div>
  );
};
