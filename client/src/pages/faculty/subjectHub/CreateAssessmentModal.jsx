import React, { useState } from 'react';
import api from '../../../api/axiosInstance';

export const CreateAssessmentModal = ({ offeringId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('IA');
  const [maxMarks, setMaxMarks] = useState(25);
  const [conductedOn, setConductedOn] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/api/offerings/${offeringId}/assessments`, {
        title,
        type,
        maxMarks: Number(maxMarks),
        conductedOn,
      });
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-gray-800">New Assessment</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. IA-2 or Lab Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-1.5 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm"
              >
                <option value="IA">Internal Assessment (IA)</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="QUIZ">Quiz</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Max Marks</label>
              <input
                type="number"
                min="1"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Conducted Date</label>
            <input
              type="date"
              value={conductedOn}
              onChange={(e) => setConductedOn(e.target.value)}
              className="w-full border rounded px-3 py-1.5 text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded text-sm bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              {submitting ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
