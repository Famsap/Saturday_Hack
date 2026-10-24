import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export const SubjectHub = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <Link to="/faculty" className="text-xs text-blue-600 hover:underline mb-1 inline-block">
            ← Back to My Subjects
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            Subject Hub · DBMS (Offering #{id})
          </h1>
        </div>
      </header>

      {/* 4 Tabs: Overview, Sessions, Assessments, Insights */}
      <div className="bg-white border-b px-6">
        <nav className="flex space-x-6 text-sm font-medium">
          {['overview', 'sessions', 'assessments', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">Offering Overview</h2>
            <p className="text-sm text-gray-600 mb-4">
              Quick statistics and pending actions for this offering.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-600 uppercase font-semibold">Average Attendance</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">87.5%</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">
                <p className="text-xs text-emerald-600 uppercase font-semibold">Class Avg Marks</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">74.2%</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                <p className="text-xs text-amber-600 uppercase font-semibold">At-Risk Count</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">1 Student</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Class Sessions</h2>
              <button className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700">
                + Start Session
              </button>
            </div>
            <p className="text-sm text-gray-500 italic">
              Session attendance recording grid placeholder. Ready for full implementation.
            </p>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Assessments Cycle</h2>
              <button className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700">
                + New Assessment
              </button>
            </div>
            <p className="text-sm text-gray-500 italic">
              Marks entry and draft-to-publish workflow placeholder. Ready for full implementation.
            </p>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">Insights & At-Risk Intervention</h2>
            <p className="text-sm text-gray-500 italic">
              At-risk list, alert triggers, and remarks entry placeholder. Ready for full implementation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
