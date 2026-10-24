import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { AttendanceDoughnut } from '../../components/charts/AttendanceDoughnut';

export const MySubjects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/offerings')
      .then((res) => setOfferings(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load subjects'))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = offerings.reduce((a, o) => a + (o.section?._count?.students || 0), 0);
  const totalAtRisk = offerings.reduce((a, o) => a + (o.stats?.atRiskCount || 0), 0);
  const avgAttendance = offerings.length > 0
    ? Math.round(offerings.reduce((a, o) => a + (o.stats?.attendanceAvg || 100), 0) / offerings.length)
    : 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Faculty Portal</h1>
          <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/faculty/setup" className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded border border-blue-200">
            Manage Setup
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Subjects</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{offerings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Students</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Avg Attendance</p>
            <p className={`text-2xl font-bold mt-1 ${avgAttendance < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>{avgAttendance}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">At-Risk Count</p>
            <p className={`text-2xl font-bold mt-1 ${totalAtRisk > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totalAtRisk}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700">My Assigned Subjects</h2>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading your subjects...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200">{error}</div>
        ) : offerings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-600 mb-4">No subjects assigned yet.</p>
            <Link to="/faculty/setup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded">Set Up Offerings</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((o) => {
              const att = o.stats?.attendanceAvg || 100;
              const atRisk = o.stats?.atRiskCount || 0;
              return (
                <div key={o.id} className="bg-white rounded-lg border shadow-sm p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{o.subject?.code}</span>
                      <span className="text-xs text-gray-400">{o.subject?.credits} Credits</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800">{o.subject?.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{o.section?.name} • {o.section?.semester}</p>
                    <div className="my-4">
                      <AttendanceDoughnut present={Math.round(att)} late={Math.max(0, Math.round((100 - att) * 0.3))} absent={Math.max(0, Math.round((100 - att) * 0.7))} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3 mt-2 text-xs">
                    <span className={atRisk > 0 ? 'text-amber-700 font-medium' : 'text-emerald-700 font-medium'}>
                      {atRisk > 0 ? `⚠ ${atRisk} At-Risk` : '✓ All On Track'}
                    </span>
                    <Link to={`/faculty/offerings/${o.id}`} className="font-semibold text-blue-600 hover:underline">Open Hub →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

