import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { CreateSessionModal } from './CreateSessionModal';
import { AttendanceModal } from './AttendanceModal';

export const SessionsTab = ({ offeringId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/offerings/${offeringId}/sessions`);
      setSessions(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offeringId) fetchSessions();
  }, [offeringId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Class Sessions</h2>
          <p className="text-xs text-gray-500">Record, edit, and lock session attendance.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          + New Session
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading sessions...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="p-8 bg-white rounded border text-center text-gray-500">
          No sessions recorded yet. Click "+ New Session" to create one.
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {new Date(s.sessionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">Period {s.period}</td>
                  <td className="px-4 py-3">{s.topic || 'General Lecture'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        s.status === 'LOCKED'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedSession(s)}
                      className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 font-semibold"
                    >
                      {s.status === 'LOCKED' ? 'View / Unlock' : 'Take Attendance'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateSessionModal
          offeringId={offeringId}
          onClose={() => setShowCreate(false)}
          onCreated={fetchSessions}
        />
      )}

      {selectedSession && (
        <AttendanceModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onUpdated={fetchSessions}
        />
      )}
    </div>
  );
};
