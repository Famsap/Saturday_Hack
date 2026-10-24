import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionsTab } from './setup/SectionsTab';
import { SubjectsTab } from './setup/SubjectsTab';
import { OfferingsTab } from './setup/OfferingsTab';
import { StudentsTab } from './setup/StudentsTab';

export const Setup = () => {
  const [activeTab, setActiveTab] = useState('sections');

  const tabs = [
    { key: 'sections', label: 'Sections' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'offerings', label: 'Offerings' },
    { key: 'students', label: 'Students' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <Link to="/faculty" className="text-xs text-blue-600 hover:underline mb-1 inline-block">
            ← Back to Faculty Portal
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Academic Term Setup</h1>
        </div>
      </header>

      {/* Setup Tabs */}
      <div className="bg-white border-b px-6 shadow-xs">
        <nav className="flex space-x-6 text-sm font-medium">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3.5 border-b-2 transition capitalize ${
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
        {activeTab === 'sections' && <SectionsTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'offerings' && <OfferingsTab />}
        {activeTab === 'students' && <StudentsTab />}
      </main>
    </div>
  );
};

