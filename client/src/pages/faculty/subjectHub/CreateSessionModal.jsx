import React, { useState } from 'react';
import api from '../../../api/axiosInstance';

export const CreateSessionModal = ({ offeringId, onClose, onCreated }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(1);
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/api/offerings/${offeringId}/sessions`, {
        sessionDate: date,
        period: Number(period),
        topic,
      });
      onCreated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-gray-800">New Class Session</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded px-3 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Period (1-8)</label>
            <input
              type="number"
              min="1"
              max="8"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border rounded px-3 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Topic</label>
            <input
              type="text"
              placeholder="e.g. Relational Algebra Basics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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
              className="px-4 py-1.5 rounded text-sm bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
