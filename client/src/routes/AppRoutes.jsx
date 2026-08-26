import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { ComplaintsList } from '../pages/ComplaintsList';
import { ComplaintDetails } from '../pages/ComplaintDetails';
import { ReportComplaint } from '../pages/ReportComplaint';
import { Auth } from '../pages/Auth';
import ProtectedRoute from '../components/protectedroutes/ProtectedRoutes';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      {/* Main Layout containing Navbar & Sidebar wrap */}
      < Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>


      }>


        {/* Page paths */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="complaints" element={<ComplaintsList />} />
        <Route path="complaints/:id" element={<ComplaintDetails />} />
        <Route path="report" element={<ReportComplaint />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
