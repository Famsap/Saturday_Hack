import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { MySubjects } from '../pages/faculty/MySubjects';
import { SubjectHub } from '../pages/faculty/SubjectHub';
import { Setup } from '../pages/faculty/Setup';
import { StudentDashboard } from '../pages/student/Dashboard';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Faculty Routes */}
      <Route element={<ProtectedRoute allowedRoles={['FACULTY']} />}>
        <Route path="/faculty" element={<MySubjects />} />
        <Route path="/faculty/setup" element={<Setup />} />
        <Route path="/faculty/offerings/:id" element={<SubjectHub />} />
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route path="/student" element={<StudentDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
