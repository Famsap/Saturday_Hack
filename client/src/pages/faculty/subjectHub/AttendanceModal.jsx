import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const AttendanceModal = ({ session, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    api.get(`/api/sessions/${session.id}/sheet`)
      .then((res) => {
        const d = res.data.data;
        setSheet(d);
        const map = {};
        d.students.forEach((s) => { map[s.studentId] = s.status || 'PRESENT'; });
        setStatuses(map);
      })
      .catch((e) => alert(e.response?.data?.message || 'Failed to load sheet'))
      .finally(() => setLoading(false));
  }, [session.id]);

  const markAll = (st) => {
    if (!sheet) return;
    const next = {};
    sheet.students.forEach((s) => { next[s.studentId] = st; });
    setStatuses(next);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const records = Object.entries(statuses).map(([sid, status]) => ({
        studentId: Number(sid),
        status,
      }));
      await api.put(`/api/sessions/${session.id}/attendance`, { records });
      alert('Attendance saved!');
      onUpdated();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async () => {
    try {
      setLocking(true);
      if (session.status === 'OPEN') {
        const records = Object.entries(statuses).map(([sid, status]) => ({
          studentId: Number(sid),
          status,
        }));
        await api.put(`/api/sessions/${session.id}/attendance`, { records });
        await api.put(`/api/sessions/${session.id}/lock`);
        alert('Attendance locked!');
      } else {
        await api.post(`/api/sessions/${session.id}/reopen`);
        alert('Session reopened!');
      }
      onUpdated();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update lock');
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Period {session.period} · {new Date(session.sessionDate).toLocaleDateString()}
            </h3>
            <p className="text-xs text-gray-500">{session.topic || 'General Lecture'}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${session.status === 'LOCKED' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {session.status}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading student roster...</div>
        ) : (
          <>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
              <span className="text-gray-600 font-medium">Quick Fill:</span>
              <div className="space-x-2">
                <button type="button" disabled={session.status === 'LOCKED'} onClick={() => markAll('PRESENT')} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">All Present</button>
                <button type="button" disabled={session.status === 'LOCKED'} onClick={() => markAll('ABSENT')} className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">All Absent</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border rounded">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-2">USN</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-700">
                  {sheet?.students?.map((st) => (
                    <tr key={st.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{st.usn}</td>
                      <td className="px-4 py-2">{st.name}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="inline-flex rounded-md shadow-sm">
                          {['PRESENT', 'LATE', 'ABSENT'].map((status) => {
                            const active = (statuses[st.studentId] || 'PRESENT') === status;
                            const cls = active ? (status === 'PRESENT' ? 'bg-emerald-600 text-white' : status === 'LATE' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white') : 'bg-white text-gray-700';
                            return (
                              <button key={status} type="button" disabled={session.status === 'LOCKED'} onClick={() => setStatuses((p) => ({ ...p, [st.studentId]: status }))} className={`px-3 py-1 text-xs font-semibold border ${cls} first:rounded-l last:rounded-r`}>
                                {status[0]}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <button type="button" onClick={handleToggleLock} disabled={locking} className="text-xs px-3 py-1.5 rounded font-semibold border bg-gray-50 hover:bg-gray-100 text-gray-700">
                {locking ? 'Updating...' : session.status === 'OPEN' ? '🔒 Save & Lock' : '🔓 Reopen'}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100">Close</button>
                {session.status === 'OPEN' && (
                  <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-1.5 rounded text-sm bg-emerald-600 text-white font-semibold hover:bg-emerald-700">
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
