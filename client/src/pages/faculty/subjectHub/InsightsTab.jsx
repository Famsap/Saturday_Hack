import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';

export const InsightsTab = ({ offeringId }) => {
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  const fetchAtRisk = async () => {
    try {
      setLoading(true);
      setError(null);
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
      setFeedback('');
      await api.post(`/api/students/${selectedStudent.student.id}/remarks`, {
        offeringId: Number(offeringId),
        note: remarkText.trim(),
      });
      setFeedback(`Note added for ${selectedStudent.student.name}.`);
      setRemarkText('');
      setSelectedStudent(null);
      fetchAtRisk();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to add remark.');
    } finally {
      setSubmittingRemark(false);
    }
  };

  const visibleStudents = atRiskList.filter((item) => (
    `${item.student.name} ${item.student.usn} ${item.student.email}`.toLowerCase().includes(search.trim().toLowerCase())
  ));
  const criticalCount = atRiskList.filter((item) => item.alerts.some((alert) => alert.severity === 'CRITICAL')).length;

  return (
    <div className="space-y-6 insight-workspace">
      <div className="insight-heading">
        <div>
          <span className="eyebrow">EARLY SUPPORT, MADE THOUGHTFUL</span>
          <h2 className="text-lg font-bold text-gray-800">Class insights</h2>
          <p className="text-xs text-gray-500">A timely, personal check-in can make a real difference.</p>
        </div>
        <button onClick={fetchAtRisk} disabled={loading} className="insight-refresh">
          <span>↻</span> {loading ? 'Updating…' : 'Refresh insights'}
        </button>
      </div>
      {!loading && !error && <div className="insight-summary">
        <div><span className="insight-summary-icon">♧</span><span><strong>{atRiskList.length}</strong><small>Learners flagged</small></span></div>
        <div><span className="insight-summary-icon insight-summary-urgent">!</span><span><strong>{criticalCount}</strong><small>Priority check-ins</small></span></div>
        <label className="management-search insight-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a student..." aria-label="Find a student" /></label>
      </div>}
      {feedback && <div className={`management-alert ${feedback.includes('Failed') ? 'management-alert-error' : 'management-alert-success'}`} role="status">{feedback}</div>}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Analyzing student performance & attendance...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>
      ) : atRiskList.length === 0 ? (
        <div className="insight-empty">
          <span>✦</span>
          <h3>Everyone is on track</h3>
          <p>No academic alerts right now. Keep encouraging your students to show up, ask questions, and keep learning.</p>
        </div>
      ) : visibleStudents.length === 0 ? (
        <div className="insight-empty"><span>⌕</span><h3>No students found</h3><p>Try another name, email, or university number.</p></div>
      ) : (
        <div className="insight-student-list">
          {visibleStudents.map((item) => (
            <div key={item.student.id} className="insight-student-card">
              <div className="insight-student-heading">
                <div>
                  <div className="insight-student-identity">
                    <span className="avatar avatar-lilac">{(item.student.name || 'S').charAt(0).toUpperCase()}</span>
                    <span><span className="management-usn">{item.student.usn}</span><h3>{item.student.name}</h3></span>
                  </div>
                  <p className="insight-student-email">{item.student.email}</p>
                </div>
                <button onClick={() => { setFeedback(''); setSelectedStudent(item); }} className="insight-remark-button"><span>＋</span> Add a note</button>
              </div>

              <div className="insight-stats">
                <div><span>ATTENDANCE</span><strong className={item.attendancePct < 75 ? 'insight-warn' : ''}>{item.attendancePct}%</strong>{item.classesNeeded > 0 && <small>{item.classesNeeded} classes to reach 75%</small>}</div>
                <div><span>ASSESSMENT PERFORMANCE</span><strong className={item.performancePct < 40 ? 'insight-warn' : ''}>{item.performancePct}%</strong><small>Across published marks</small></div>
                <div><span>ACADEMIC SIGNALS</span><strong>{item.alerts.length}</strong><small>Items to discuss</small></div>
              </div>
              <div className="insight-alert-list">
                {item.alerts.map((alt, idx) => (
                  <div key={idx} className={`insight-alert ${alt.severity === 'CRITICAL' ? 'insight-alert-critical' : ''}`}>
                    <span className="insight-alert-mark">{alt.severity === 'CRITICAL' ? '!' : 'i'}</span><span><strong>{alt.type.replaceAll('_', ' ')}</strong>
                    {alt.message}
                    </span>
                  </div>
                ))}
              </div>

              {item.remarks && item.remarks.length > 0 && (
                <div className="insight-notes">
                  <p>FACULTY NOTES</p>
                  {item.remarks.map((rem) => (
                    <div key={rem.id} className="insight-note">
                      <div>
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
        <div className="management-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submittingRemark) setSelectedStudent(null); }}>
          <section className="management-modal" role="dialog" aria-modal="true" aria-labelledby="remark-modal-title">
            <button className="management-modal-close" onClick={() => setSelectedStudent(null)} disabled={submittingRemark} aria-label="Close dialog">×</button>
            <span className="eyebrow">A PERSONAL CHECK-IN</span><h3 id="remark-modal-title">Add a faculty note</h3><p>This private academic note will be visible to {selectedStudent.student.name} in their dashboard.</p>
            <form onSubmit={handleAddRemark} className="management-form">
              <label>Note for {selectedStudent.student.name}<textarea rows="5" placeholder="Share a supportive, actionable next step…" value={remarkText} onChange={(e) => setRemarkText(e.target.value)} required /></label>
              <div className="management-modal-actions"><button type="button" className="button button-secondary" onClick={() => setSelectedStudent(null)} disabled={submittingRemark}>Cancel</button><button type="submit" disabled={submittingRemark} className="button button-primary">{submittingRemark ? 'Saving…' : 'Save note'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
