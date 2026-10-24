import React from 'react';

export const OverviewTab = ({ offering, stats, onNavigateTab }) => {
  if (!offering) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs text-blue-600 uppercase font-semibold">Average Attendance</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.attendanceAvg ?? 100}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.totalSessions ?? 0} locked sessions</p>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs text-emerald-600 uppercase font-semibold">Class Avg Marks</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.performanceAvg ?? 0}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.totalAssessments ?? 0} published tests</p>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs text-amber-600 uppercase font-semibold">At-Risk Students</p>
          <p className={`text-3xl font-bold mt-1 ${stats?.atRiskCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {stats?.atRiskCount ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Below attendance or marks threshold</p>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm">
          <p className="text-xs text-purple-600 uppercase font-semibold">Class Strength</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalStudents ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Enrolled in {offering.section?.name}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-3">Offering Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-400 block">Subject</span>
            <span className="font-semibold text-gray-800">{offering.subject?.code} - {offering.subject?.name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Section & Semester</span>
            <span className="font-semibold text-gray-800">{offering.section?.name} ({offering.section?.semester})</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Academic Year</span>
            <span className="font-semibold text-gray-800">{offering.section?.academicYear}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Credits</span>
            <span className="font-semibold text-gray-800">{offering.subject?.credits} Credits</span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t flex flex-wrap gap-3">
          <button
            onClick={() => onNavigateTab('sessions')}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            📋 Manage & Record Sessions
          </button>
          <button
            onClick={() => onNavigateTab('assessments')}
            className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded shadow hover:bg-emerald-700 transition"
          >
            📊 Manage Assessments & Marks
          </button>
          <button
            onClick={() => onNavigateTab('insights')}
            className="bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded shadow hover:bg-amber-700 transition"
          >
            ⚠ Review At-Risk Interventions
          </button>
        </div>
      </div>
    </div>
  );
};
