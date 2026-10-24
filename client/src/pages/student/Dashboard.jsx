import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AttendanceDoughnut } from '../../components/charts/AttendanceDoughnut';
import { PerformanceBar } from '../../components/charts/PerformanceBar';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Student Progress Portal</h1>
          <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
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
        {/* Intervention Alert Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-semibold text-amber-800">
                Attendance Warning: 68% in DBMS
              </p>
              <p className="text-xs text-amber-700 mt-1">
                You need to attend the next <strong>3 classes</strong> to reach the 75% requirement.
              </p>
            </div>
          </div>
        </div>

        {/* Overview Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
              Overall Attendance
            </h3>
            <AttendanceDoughnut present={72} late={4} absent={24} />
          </div>

          <div className="bg-white p-5 rounded-lg border shadow-sm md:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
              Subject-Wise Performance
            </h3>
            <PerformanceBar />
          </div>
        </div>
      </main>
    </div>
  );
};
