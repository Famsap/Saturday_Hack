import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { OverviewTab } from './subjectHub/OverviewTab';
import { SessionsTab } from './subjectHub/SessionsTab';
import { AssessmentsTab } from './subjectHub/AssessmentsTab';
import { InsightsTab } from './subjectHub/InsightsTab';

export const SubjectHub = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [offering, setOffering] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOfferingData = async () => {
    try {
      setLoading(true);
      const [offeringRes, statsRes] = await Promise.all([
        api.get(`/api/offerings/${id}`),
        api.get(`/api/offerings/${id}/stats`),
      ]);
      setOffering(offeringRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subject offering details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOfferingData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading Subject Hub...
      </div>
    );
  }

  if (error || !offering) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error || 'Offering not found.'}</p>
        <Link to="/faculty" className="text-sm bg-blue-600 text-white px-4 py-2 rounded">
          Back to My Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <Link to="/faculty" className="text-xs text-blue-600 hover:underline mb-1 inline-block">
            ← Back to My Subjects
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded">
              {offering.subject?.code}
            </span>
            <h1 className="text-xl font-bold text-gray-800">
              {offering.subject?.name}
            </h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {offering.section?.name} · {offering.section?.semester}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/setup"
            className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded"
          >
            Term Setup
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-6 shadow-xs">
        <nav className="flex space-x-6 text-sm font-medium">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'sessions', label: `Sessions (${stats?.totalSessions ?? 0})` },
            { key: 'assessments', label: `Assessments (${stats?.totalAssessments ?? 0})` },
            {
              key: 'insights',
              label: (
                <span className="flex items-center gap-1.5">
                  Insights & At-Risk
                  {stats?.atRiskCount > 0 && (
                    <span className="text-xs px-1.5 py-0.2 bg-red-100 text-red-700 rounded-full font-bold">
                      {stats.atRiskCount}
                    </span>
                  )}
                </span>
              ),
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3.5 border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'overview' && (
          <OverviewTab offering={offering} stats={stats} onNavigateTab={setActiveTab} />
        )}
        {activeTab === 'sessions' && <SessionsTab offeringId={id} />}
        {activeTab === 'assessments' && <AssessmentsTab offeringId={id} />}
        {activeTab === 'insights' && <InsightsTab offeringId={id} />}
      </main>
    </div>
  );
};

