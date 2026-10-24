import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const InsightsTab = ({ offeringId }) => {
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);

  const fetchAtRisk = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/offerings/${offeringId}/at-risk`);
      setAtRiskList(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load at-risk students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offeringId) fetchAtRisk();
  }, [offeringId]);

  const handleAddRemark = async (e) => {
    e.preventDefault();
    if (!remarkText.trim() || !selectedStudent) return;
    try {
      setSubmittingRemark(true);
      await api.post(`/api/students/${selectedStudent.student.id}/remarks`, {
        offeringId: Number(offeringId),
        note: remarkText.trim(),
      });
      alert('Counseling remark saved!');
      setRemarkText('');
      setSelectedStudent(null);
      fetchAtRisk();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add remark');
    } finally {
      setSubmittingRemark(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Insights & Intervention Engine</h2>
          <p className="text-xs text-gray-500">Automated alerts identifying students needing academic and attendance intervention.</p>
        </div>
        <button onClick={fetchAtRisk} className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 font-medium">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Analyzing student performance & attendance...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>
      ) : atRiskList.length === 0 ? (
        <div className="p-12 bg-white rounded-lg border text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="text-base font-bold text-emerald-800">No Students At Risk!</h3>
          <p className="text-xs text-gray-500">All students are currently meeting attendance and assessment requirements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {atRiskList.map((item) => (
            <div key={item.student.id} className="bg-white rounded-lg border shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-semibold">{item.student.usn}</span>
                    <h3 className="font-bold text-gray-800">{item.student.name}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{item.student.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Attendance</span>
                    <span className={`font-bold ${item.attendancePct < 75 ? 'text-red-600' : 'text-emerald-600'}`}>{item.attendancePct}%</span>
                    {item.classesNeeded > 0 && <span className="text-xs text-amber-600 ml-1">(+{item.classesNeeded} cls)</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Performance</span>
                    <span className={`font-bold ${item.performancePct < 40 ? 'text-red-600' : 'text-blue-600'}`}>{item.performancePct}%</span>
                  </div>
                  <button onClick={() => setSelectedStudent(item)} className="text-xs bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1.5 rounded font-semibold hover:bg-amber-100">
                    + Remark
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {item.alerts.map((alt, idx) => (
                  <div key={idx} className={`text-xs p-2.5 rounded border-l-4 ${alt.severity === 'CRITICAL' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-amber-50 border-amber-500 text-amber-800'}`}>
                    <span className="font-semibold uppercase mr-1">[{alt.type.replace('_', ' ')}]</span>
                    {alt.message}
                  </div>
                ))}
              </div>

              {item.remarks && item.remarks.length > 0 && (
                <div className="border-t pt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Counseling Notes</p>
                  {item.remarks.map((rem) => (
                    <div key={rem.id} className="text-xs bg-gray-50 p-2 rounded border text-gray-700">
                      <div className="flex justify-between text-gray-400 text-[10px] mb-1">
                        <span>{rem.author?.name || 'Faculty'}</span>
                        <span>{new Date(rem.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{rem.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-gray-800">Add Counseling Remark · {selectedStudent.student.name}</h3>
            <form onSubmit={handleAddRemark} className="space-y-3">
              <textarea rows="4" placeholder="Enter counseling note..." value={remarkText} onChange={(e) => setRemarkText(e.target.value)} className="w-full border rounded p-2.5 text-sm" required />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedStudent(null)} className="px-4 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={submittingRemark} className="px-4 py-1.5 rounded text-sm bg-amber-600 text-white font-semibold hover:bg-amber-700">{submittingRemark ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
