import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { CreateAssessmentModal } from './CreateAssessmentModal';
import { MarksModal } from './MarksModal';

export const AssessmentsTab = ({ offeringId }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [editingAssessment, setEditingAssessment] = useState(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/offerings/${offeringId}/assessments`);
      setAssessments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assessment) => {
    if (!window.confirm(`Delete "${assessment.title}" and its recorded marks? This cannot be undone.`)) return;
    setError(null);
    try {
      await api.delete(`/api/assessments/${assessment.id}`);
      await fetchAssessments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assessment');
    }
  };

  useEffect(() => {
    if (offeringId) fetchAssessments();
  }, [offeringId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Assessments Cycle</h2>
          <p className="text-xs text-gray-500">Manage internal tests, assignments, and grade book.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded shadow hover:bg-emerald-700 transition"
        >
          + New Assessment
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading assessments...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded flex items-center justify-between gap-3">{error}<button type="button" onClick={fetchAssessments} className="text-xs font-semibold underline">Try again</button></div>
      ) : assessments.length === 0 ? (
        <div className="p-8 bg-white rounded border text-center text-gray-500">
          No assessments created yet. Click "+ New Assessment" to add one.
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Max Marks</th>
                <th className="px-4 py-3">Conducted On</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700">
                      {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.maxMarks}</td>
                  <td className="px-4 py-3">
                    {a.conductedOn ? new Date(a.conductedOn).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        a.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {a.status === 'DRAFT' && <button type="button" onClick={() => setEditingAssessment(a)} className="text-xs bg-white text-gray-600 border border-gray-200 px-2.5 py-1 rounded hover:bg-gray-50 font-semibold">Edit</button>}
                      <button
                        onClick={() => setSelectedAssessment(a)}
                        className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded hover:bg-emerald-100 font-semibold"
                      >
                        {a.status === 'PUBLISHED' ? 'View / Edit Marks' : 'Enter Marks'}
                      </button>
                      <button type="button" onClick={() => handleDelete(a)} className="text-xs text-red-600 px-1.5 py-1 rounded hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateAssessmentModal
          offeringId={offeringId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchAssessments}
        />
      )}
      {editingAssessment && (
        <CreateAssessmentModal
          offeringId={offeringId}
          assessment={editingAssessment}
          onClose={() => setEditingAssessment(null)}
          onCreated={fetchAssessments}
        />
      )}

      {selectedAssessment && (
        <MarksModal
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          onUpdated={fetchAssessments}
        />
      )}
    </div>
  );
};
