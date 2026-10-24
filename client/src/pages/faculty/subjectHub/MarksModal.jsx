import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const MarksModal = ({ assessment, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.get(`/api/assessments/${assessment.id}/marks`)
      .then((res) => {
        const d = res.data.data;
        setStudents(d.students || []);
        const map = {};
        (d.students || []).forEach((s) => {
          map[s.studentId] = s.marksObtained ?? 0;
        });
        setMarksMap(map);
      })
      .catch((e) => alert(e.response?.data?.message || 'Failed to load marks'))
      .finally(() => setLoading(false));
  }, [assessment.id]);

  const handleSaveMarks = async () => {
    try {
      setSaving(true);
      const marks = Object.entries(marksMap).map(([sid, score]) => ({
        studentId: Number(sid),
        marksObtained: Number(score),
      }));
      await api.put(`/api/assessments/${assessment.id}/marks`, { marks });
      alert('Marks saved successfully!');
      onUpdated();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      // Save current marks first
      const marks = Object.entries(marksMap).map(([sid, score]) => ({
        studentId: Number(sid),
        marksObtained: Number(score),
      }));
      await api.put(`/api/assessments/${assessment.id}/marks`, { marks });
      await api.post(`/api/assessments/${assessment.id}/publish`);
      alert('Assessment published! Marks are now visible to students.');
      onUpdated();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-800">{assessment.title}</h3>
            <p className="text-xs text-gray-500">
              Type: {assessment.type} • Max Marks: {assessment.maxMarks} • {new Date(assessment.conductedOn).toLocaleDateString()}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${assessment.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {assessment.status}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading student marks sheet...</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto border rounded">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-2">USN</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2 text-right">Marks (/{assessment.maxMarks})</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {students.map((st) => (
                    <tr key={st.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{st.usn}</td>
                      <td className="px-4 py-2">{st.name}</td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min="0"
                          max={assessment.maxMarks}
                          value={marksMap[st.studentId] ?? 0}
                          onChange={(e) => setMarksMap((p) => ({ ...p, [st.studentId]: e.target.value }))}
                          className="w-20 border rounded px-2 py-1 text-right text-sm font-semibold"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              {assessment.status === 'DRAFT' ? (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="text-xs px-3 py-1.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                >
                  {publishing ? 'Publishing...' : '📢 Publish to Students'}
                </button>
              ) : (
                <span className="text-xs text-gray-500 italic">Published to students</span>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100">
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveMarks}
                  disabled={saving}
                  className="px-4 py-1.5 rounded text-sm bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
