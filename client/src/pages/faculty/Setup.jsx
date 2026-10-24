import React from 'react';
import { Link } from 'react-router-dom';

export const Setup = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <Link to="/faculty" className="text-xs text-blue-600 hover:underline mb-1 inline-block">
            ← Back to Faculty Portal
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Term Setup</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-bold mb-2">Sections, Subjects, Offerings & Students</h2>
          <p className="text-sm text-gray-500 mb-6">
            Stage 1 term setup components (tabbed CRUD and CSV import) ready for implementation.
          </p>
        </div>
      </main>
    </div>
  );
};
