import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [saving, setSaving] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('USN,Name,Email\n1RV21CS005,Emma Watson,emma@demo.com\n1RV21CS006,David Miller,david@demo.com');
  const [importSectionId, setImportSectionId] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchSections = async () => {
    try {
      const res = await api.get('/api/sections');
      const data = res.data.data || [];
      setSections(data);
      if (data.length > 0) {
        setSectionId(data[0].id);
        setImportSectionId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = selectedSection ? `/api/students?sectionId=${selectedSection}` : '/api/students';
      const res = await api.get(url);
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSections(); }, []);
  useEffect(() => { fetchStudents(); }, [selectedSection]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/api/students', { name, email, usn, sectionId: Number(sectionId) });
      setShowAddModal(false);
      setName(''); setEmail(''); setUsn('');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvText.trim() || !importSectionId) return;
    const lines = csvText.trim().split('\n');
    const parsedList = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim());
      if (parts[0].toLowerCase() === 'usn' || parts.length < 3) continue;
      parsedList.push({ usn: parts[0], name: parts[1], email: parts[2], sectionId: Number(importSectionId) });
    }
    if (parsedList.length === 0) return alert('No valid student rows found.');
    try {
      setImporting(true);
      const res = await api.post('/api/students/import', { students: parsedList });
      alert(`Imported ${res.data.data?.inserted ?? 0} students.`);
      setShowImportModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-base font-bold text-gray-800">Student Directory</h2>
          <p className="text-xs text-gray-500">Manage enrollment and batch imports.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="text-xs border rounded px-2.5 py-1.5 bg-white text-gray-700">
            <option value="">All Sections</option>
            {sections.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.semester})</option>))}
          </select>
          <button onClick={() => setShowImportModal(true)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded font-medium hover:bg-emerald-700">
            📥 CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700">
            + Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded">{error}</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">USN</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Section</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {students.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No students.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{s.usn}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.user?.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.user?.email}</td>
                    <td className="px-4 py-3 text-xs">{s.section?.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-800">Add Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-3 text-sm">
              <input type="text" placeholder="USN (e.g. 1RV21CS010)" value={usn} onChange={(e) => setUsn(e.target.value)} className="w-full border rounded px-3 py-1.5 uppercase font-mono" required />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
              <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} className="w-full border rounded px-3 py-1.5" required>
                {sections.map((sec) => (<option key={sec.id} value={sec.id}>{sec.name} ({sec.semester})</option>))}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">{saving ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-800">Batch Import Students via CSV</h3>
            <p className="text-xs text-gray-500">Paste CSV rows with <code>USN,Name,Email</code>.</p>
            <form onSubmit={handleImport} className="space-y-3 text-sm">
              <select value={importSectionId} onChange={(e) => setImportSectionId(e.target.value)} className="w-full border rounded px-3 py-1.5" required>
                {sections.map((sec) => (<option key={sec.id} value={sec.id}>{sec.name} ({sec.semester})</option>))}
              </select>
              <textarea rows="5" value={csvText} onChange={(e) => setCsvText(e.target.value)} className="w-full font-mono text-xs border rounded p-2" required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowImportModal(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={importing} className="px-4 py-1.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700">{importing ? 'Importing...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
