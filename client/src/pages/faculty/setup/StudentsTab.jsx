import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../api/axiosInstance';

const blankStudent = { name: '', email: '', usn: '', sectionId: '' };
const starterCsv = 'USN,Name,Email\n1RV26CS005,Emma Watson,emma@demo.com\n1RV26CS006,David Miller,david@demo.com';

function parseCsvRow(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

export const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankStudent);
  const [saving, setSaving] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState(starterCsv);
  const [importSectionId, setImportSectionId] = useState('');
  const [importing, setImporting] = useState(false);

  async function fetchSections() {
    try {
      const response = await api.get('/api/sections');
      const items = response.data.data || [];
      setSections(items);
      setForm((current) => ({ ...current, sectionId: current.sectionId || String(items[0]?.id || '') }));
      setImportSectionId((current) => current || String(items[0]?.id || ''));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sections.');
    }
  }

  async function fetchStudents() {
    try {
      setLoading(true);
      setError('');
      const url = selectedSection ? `/api/students?sectionId=${selectedSection}` : '/api/students';
      const response = await api.get(url);
      setStudents(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load the student directory.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSections(); }, []);
  useEffect(() => { fetchStudents(); }, [selectedSection]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? students.filter((student) => `${student.usn} ${student.user?.name} ${student.user?.email} ${student.section?.name}`.toLowerCase().includes(term)) : students;
  }, [students, search]);

  function openForm(student = null) {
    setFormOpen(true);
    setEditing(student);
    setForm(student
      ? { name: student.user?.name || '', email: student.user?.email || '', usn: student.usn, sectionId: String(student.sectionId) }
      : { ...blankStudent, sectionId: String(sections[0]?.id || '') });
    setError('');
    setNotice('');
  }

  async function handleStudentSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, name: form.name.trim(), email: form.email.trim(), usn: form.usn.trim().toUpperCase(), sectionId: Number(form.sectionId) };
      if (editing) await api.put(`/api/students/${editing.id}`, payload);
      else await api.post('/api/students', payload);
      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? 'Student details updated.' : 'Student added to the roster.');
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this student.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.user?.name} (${student.usn})? This also deletes their attendance records, marks, and faculty notes.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/api/students/${student.id}`);
      setNotice(`${student.user?.name || 'Student'} removed from the directory.`);
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove this student.');
    }
  }

  async function handleImport(event) {
    event.preventDefault();
    if (!csvText.trim() || !importSectionId) return;
    const rows = csvText.split(/\r?\n/).filter((line) => line.trim()).map(parseCsvRow);
    const parsedStudents = rows
      .filter((row, index) => !(index === 0 && row[0]?.toLowerCase() === 'usn'))
      .filter((row) => row.length >= 3 && row.slice(0, 3).every(Boolean))
      .map(([usn, name, email]) => ({ usn: usn.toUpperCase(), name, email, sectionId: Number(importSectionId) }));
    if (!parsedStudents.length) {
      setError('No valid student rows found. Include USN, name, and email for each student.');
      return;
    }
    setImporting(true);
    setError('');
    setNotice('');
    try {
      const response = await api.post('/api/students/import', { students: parsedStudents });
      const result = response.data.data;
      const failures = result.errors || [];
      setNotice(`Imported ${result.inserted} of ${parsedStudents.length} students${failures.length ? ` · ${failures.length} row${failures.length === 1 ? '' : 's'} need attention` : ''}.`);
      if (failures.length) setError(failures.slice(0, 3).map((item) => item.error).join(' · '));
      setImportOpen(false);
      await fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Student import failed.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="management-content">
      <div className="management-heading"><div><span className="eyebrow">YOUR LEARNER ROSTER</span><h2>Student directory</h2><p>Keep enrollment details current and bring your class list in with CSV.</p></div><div className="management-heading-actions"><button className="button button-secondary" onClick={() => { setImportOpen(true); setError(''); }} disabled={!sections.length}>↑ Import CSV</button><button className="button button-primary" onClick={() => openForm()} disabled={!sections.length}><span>＋</span> Add student</button></div></div>
      <div className="management-toolbar"><label className="management-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or USN..." aria-label="Search students" /></label><label className="management-filter"><span>Section</span><select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} aria-label="Filter students by section"><option value="">All sections</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name} · {section.semester}</option>)}</select></label><span className="management-result">{filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}</span></div>
      {error && !formOpen && !importOpen && <div className="management-alert management-alert-error" role="alert">{error}<button onClick={fetchStudents}>Refresh list</button></div>}
      {notice && !formOpen && !importOpen && <div className="management-alert management-alert-success" role="status">{notice}</div>}
      {loading ? <div className="management-empty"><span className="loading-orbit" />Loading students…</div> : !error && <div className="management-table-wrap"><table className="management-table">
        <thead><tr><th>Student</th><th>University number</th><th>Section</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{filteredStudents.map((student) => <tr key={student.id}>
          <td><span className="student-directory-cell"><span className="avatar avatar-lilac">{(student.user?.name || 'S').charAt(0).toUpperCase()}</span><span><strong className="management-primary">{student.user?.name}</strong><small className="management-secondary">{student.user?.email}</small></span></span></td>
          <td><span className="management-usn">{student.usn}</span></td><td><span className="management-count">{student.section?.name || 'Unassigned'}</span><span className="management-secondary">{student.section?.semester}</span></td>
          <td><div className="management-actions"><button onClick={() => openForm(student)} aria-label={`Edit ${student.user?.name}`}>Edit</button><button className="management-delete" onClick={() => deleteStudent(student)} aria-label={`Remove ${student.user?.name}`}>Remove</button></div></td>
        </tr>)}</tbody>
      </table>{filteredStudents.length === 0 && <div className="management-empty">{students.length ? 'No students match your search.' : 'No students in this directory yet. Add a learner or import your roster.'}</div>}</div>}

      {formOpen && <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="student-modal-title"><button className="management-modal-close" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Close dialog">×</button><span className="eyebrow">LEARNER ROSTER</span><h3 id="student-modal-title">{editing ? 'Edit student' : 'Add a student'}</h3><p>Student accounts use the demo password until they change it.</p>
        {error && <div className="management-alert management-alert-error" role="alert">{error}</div>}
        <form onSubmit={handleStudentSubmit} className="management-form"><label>Full name<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Alex Morgan" maxLength={100} required /></label><label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="alex@university.edu" maxLength={150} required /></label><label>University number (USN)<input value={form.usn} onChange={(event) => setForm({ ...form, usn: event.target.value.toUpperCase() })} placeholder="e.g. 1RV26CS010" maxLength={20} required /></label><label>Section<select value={form.sectionId} onChange={(event) => setForm({ ...form, sectionId: event.target.value })} required><option value="" disabled>Select a section</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name} · {section.semester}</option>)}</select></label><div className="management-modal-actions"><button type="button" className="button button-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add student'}</button></div></form>
      </section></div>}

      {importOpen && <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !importing) setImportOpen(false); }}><section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="import-modal-title"><button className="management-modal-close" onClick={() => setImportOpen(false)} disabled={importing} aria-label="Close dialog">×</button><span className="eyebrow">QUICK ROSTER SETUP</span><h3 id="import-modal-title">Import students</h3><p>Paste CSV rows with the columns <code>USN,Name,Email</code>. Names in quotes may include commas.</p>
        {error && <div className="management-alert management-alert-error" role="alert">{error}</div>}
        <form onSubmit={handleImport} className="management-form"><label>Section<select value={importSectionId} onChange={(event) => setImportSectionId(event.target.value)} required><option value="" disabled>Select a section</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name} · {section.semester}</option>)}</select></label><label>CSV data<textarea rows="7" value={csvText} onChange={(event) => setCsvText(event.target.value)} className="management-csv" spellCheck="false" required /></label><span className="management-form-help">New accounts are created with the demo password. Ask students to update it after their first sign-in.</span><div className="management-modal-actions"><button type="button" className="button button-secondary" onClick={() => setImportOpen(false)} disabled={importing}>Cancel</button><button type="submit" className="button button-primary" disabled={importing || !importSectionId}>{importing ? 'Importing…' : 'Import students'}</button></div></form>
      </section></div>}
    </div>
  );
};
