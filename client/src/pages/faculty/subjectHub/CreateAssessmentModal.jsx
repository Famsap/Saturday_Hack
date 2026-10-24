import React, { useState } from 'react';
import api from '../../../api/axiosInstance';

export const CreateAssessmentModal = ({ offeringId, assessment = null, onClose, onCreated }) => {
  const [title, setTitle] = useState(assessment?.title || '');
  const [type, setType] = useState(assessment?.type || 'IA');
  const [maxMarks, setMaxMarks] = useState(assessment?.maxMarks ?? 25);
  const [conductedOn, setConductedOn] = useState(assessment?.conductedOn ? new Date(assessment.conductedOn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        title: title.trim(),
        type,
        maxMarks: Number(maxMarks),
        conductedOn,
      };
      if (assessment) await api.put(`/api/assessments/${assessment.id}`, payload);
      else await api.post(`/api/offerings/${offeringId}/assessments`, payload);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) onClose(); }}>
      <div className="management-modal" role="dialog" aria-modal="true" aria-labelledby="assessment-modal-title">
        <button className="management-modal-close" onClick={onClose} disabled={submitting} aria-label="Close dialog">×</button>
        <span className="eyebrow">ASSESSMENT CYCLE</span>
        <h3 id="assessment-modal-title">{assessment ? 'Edit draft assessment' : 'Create an assessment'}</h3>
        <p>Set up the assessment. You can enter marks and publish them when they’re ready.</p>
        {error && <div className="management-alert management-alert-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="management-form">
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
          <div className="management-modal-actions">
            <button type="button" onClick={onClose} disabled={submitting} className="button button-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="button button-primary">
              {submitting ? 'Saving…' : assessment ? 'Save changes' : 'Create assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
