import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const OfferingsTab = () => {
  const [offerings, setOfferings] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offRes, secRes, subRes] = await Promise.all([
        api.get('/api/offerings'),
        api.get('/api/sections'),
        api.get('/api/subjects'),
      ]);
      setOfferings(offRes.data.data || []);
      setSections(secRes.data.data || []);
      setSubjects(subRes.data.data || []);
      if (subRes.data.data?.length > 0) setSelectedSubjectId(subRes.data.data[0].id);
      if (secRes.data.data?.length > 0) setSelectedSectionId(secRes.data.data[0].id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch offerings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedSectionId) return;
    try {
      setSaving(true);
      await api.post('/api/offerings', {
        subjectId: Number(selectedSubjectId),
        sectionId: Number(selectedSectionId),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subject offering');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-gray-800">Faculty Subject Offerings</h2>
          <p className="text-xs text-gray-500">Course instances assigned to sections for active tracking.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="text-xs bg-blue-600 text-white px-3.5 py-1.5 rounded font-medium hover:bg-blue-700">
          + Create Offering
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading offerings...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded">{error}</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3 text-center">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {offerings.length === 0 ? (
                <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-400">No offerings found.</td></tr>
              ) : (
                offerings.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{o.subject?.name}</div>
                      <div className="text-xs text-blue-600 font-mono">{o.subject?.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{o.section?.name}</div>
                      <div className="text-xs text-gray-400">{o.section?.semester}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold">
                      {o.section?._count?.students ?? 0}
                    </td>
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
            <h3 className="text-base font-bold text-gray-800">Assign Subject Offering</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full border rounded px-3 py-1.5" required>
                  {subjects.map((sub) => (<option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} className="w-full border rounded px-3 py-1.5" required>
                  {sections.map((sec) => (<option key={sec.id} value={sec.id}>{sec.name} ({sec.semester})</option>))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">{saving ? 'Saving...' : 'Assign Offering'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
