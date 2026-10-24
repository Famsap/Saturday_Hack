import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const SubjectsTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(4);
  const [saving, setSaving] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/subjects');
      setSubjects(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/api/subjects', { code, name, credits: Number(credits) });
      setShowModal(false);
      setCode('');
      setName('');
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-gray-800">Department Subjects</h2>
          <p className="text-xs text-gray-500">Manage course catalogs, course codes, and credit values.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs bg-blue-600 text-white px-3.5 py-1.5 rounded font-medium hover:bg-blue-700"
        >
          + Add Subject
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading subjects...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded">{error}</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3 text-center">Credits</th>
                <th className="px-4 py-3 text-center">Offerings</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {subjects.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No subjects found.</td></tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">{s.code}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-center">{s.credits}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{s._count?.offerings ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-800">Add New Subject</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Code</label>
                <input type="text" placeholder="e.g. CS502" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded px-3 py-1.5 uppercase" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name</label>
                <input type="text" placeholder="e.g. Computer Networks" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Credits</label>
                <input type="number" min="1" max="10" value={credits} onChange={(e) => setCredits(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">{saving ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
