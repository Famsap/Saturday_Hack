import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const SectionsTab = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('5th Semester');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [saving, setSaving] = useState(false);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/sections');
      setSections(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/api/sections', { name, semester, academicYear });
      setShowModal(false);
      setName('');
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-gray-800">Academic Sections</h2>
          <p className="text-xs text-gray-500">Manage cohort sections, semesters, and capacity.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs bg-blue-600 text-white px-3.5 py-1.5 rounded font-medium hover:bg-blue-700"
        >
          + Add Section
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading sections...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded">{error}</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Academic Year</th>
                <th className="px-4 py-3 text-center">Students</th>
                <th className="px-4 py-3 text-center">Offerings</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {sections.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">No sections found.</td></tr>
              ) : (
                sections.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3">{s.semester}</td>
                    <td className="px-4 py-3">{s.academicYear}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">
                        {s._count?.students ?? 0}
                      </span>
                    </td>
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
            <h3 className="text-base font-bold text-gray-800">Add Academic Section</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                <input type="text" placeholder="e.g. Section B" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                <input type="text" placeholder="e.g. 5th Semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year</label>
                <input type="text" placeholder="e.g. 2024-2025" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full border rounded px-3 py-1.5" required />
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
