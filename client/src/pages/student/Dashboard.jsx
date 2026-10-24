import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { AttendanceDoughnut } from '../../components/charts/AttendanceDoughnut';
import { PerformanceBar } from '../../components/charts/PerformanceBar';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOfferingId, setExpandedOfferingId] = useState(null);

  useEffect(() => {
    api.get('/api/me/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading student portal...</div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'Unable to load profile data.'}</p>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-200 px-4 py-2 rounded">Logout</button>
      </div>
    );
  }

  const { student, overall, subjects, alerts, remarks } = data;
  const attended = overall.attendedSessions || 0;
  const absent = Math.max(0, (overall.totalSessions || 0) - attended);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Student Progress Portal</h1>
          <p className="text-xs text-gray-500">{student.name} • USN: {student.usn} • {student.section} ({student.semester})</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {alerts && alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alt, idx) => (
              <div key={idx} className={`p-4 rounded border-l-4 shadow-sm ${alt.severity === 'CRITICAL' ? 'bg-red-50 border-red-500 text-red-800' : 'bg-amber-50 border-amber-500 text-amber-800'}`}>
                <p className="text-sm font-semibold">[{alt.subjectCode}] {alt.type.replace('_', ' ')}</p>
                <p className="text-xs mt-1">{alt.message}</p>
              </div>
            ))}
          </div>
        )}

        {remarks && remarks.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
            <h3 className="text-sm font-bold text-blue-900 mb-2">Faculty Advisory Remarks</h3>
            <div className="space-y-1.5">
              {remarks.map((rem, idx) => (
                <div key={idx} className="text-xs text-blue-800 bg-white/70 p-2 rounded">
                  <span className="font-semibold">[{rem.subjectCode}] {rem.author?.name}:</span> {rem.note}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-1">Overall Attendance</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">{overall.attendancePct}%</p>
            <AttendanceDoughnut present={attended} late={0} absent={absent} />
            <p className="text-xs text-center text-gray-500 mt-2">{attended} of {overall.totalSessions} sessions attended</p>
          </div>

          <div className="bg-white p-5 rounded-lg border shadow-sm md:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-1">Subject Performance</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">Avg {overall.performancePct}%</p>
            <PerformanceBar labels={subjects.map((s) => s.subjectCode)} scores={subjects.map((s) => Math.round(s.performance.percentage))} />
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800">My Subjects Breakdown</h3>
            <span className="text-xs text-gray-400">Click a subject to see assessment scores</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Faculty</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Req Next</th>
                <th className="px-4 py-3">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {subjects.map((s) => {
                const isExpanded = expandedOfferingId === s.offeringId;
                const assessments = s.performance.gradedAssessments || [];
                return (
                  <React.Fragment key={s.offeringId}>
                    <tr
                      onClick={() => setExpandedOfferingId(isExpanded ? null : s.offeringId)}
                      className="hover:bg-gray-50 cursor-pointer transition select-none"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                        <div>
                          <div>{s.subjectName}</div>
                          <div className="text-xs text-blue-600 font-mono font-normal">{s.subjectCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.facultyName}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${s.attendance.percentage < 75 ? 'text-red-600' : 'text-emerald-600'}`}>{s.attendance.percentage}%</span>
                        <span className="text-xs text-gray-400 ml-1">({s.attendance.attendedCount}/{s.attendance.totalSessions})</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {s.attendance.classesNeeded > 0 ? (
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">+{s.attendance.classesNeeded} classes</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Safe (≥75%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-blue-600">{s.performance.percentage}%</span>
                        <span className="text-xs text-gray-400 ml-1">({s.performance.totalObtained}/{s.performance.totalMax})</span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/70">
                        <td colSpan="5" className="px-6 py-3 border-y border-gray-100">
                          <p className="text-xs font-bold text-gray-600 uppercase mb-2">Graded Assessments for {s.subjectCode}</p>
                          {assessments.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No published assessments yet for this subject.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {assessments.map((asm) => (
                                <div key={asm.assessmentId} className="bg-white p-2.5 rounded border text-xs space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800 truncate">{asm.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded uppercase font-semibold">{asm.type}</span>
                                  </div>
                                  <div className="flex justify-between text-gray-600">
                                    <span>Score:</span>
                                    <span className="font-bold text-gray-900">{asm.obtainedMarks} / {asm.maxMarks} ({asm.percentage}%)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
