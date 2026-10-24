import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AttendanceDoughnut } from '../../components/charts/AttendanceDoughnut';

export const MySubjects = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Faculty Portal</h1>
          <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            to="/faculty/setup"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Manage Setup
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-sm bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">My Assigned Subjects</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  CS501
                </span>
                <h3 className="text-base font-bold text-gray-800 mt-1">
                  Database Management Systems
                </h3>
                <p className="text-xs text-gray-500">Section A • Sem 5</p>
              </div>
            </div>

            <div className="my-4">
              <AttendanceDoughnut present={85} late={5} absent={10} />
            </div>

            <div className="flex justify-between items-center border-t pt-3 mt-2 text-xs">
              <span className="text-amber-600 font-medium">1 At-Risk Student</span>
              <Link
                to="/faculty/offerings/1"
                className="font-semibold text-blue-600 hover:underline"
              >
                Open Subject Hub →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
