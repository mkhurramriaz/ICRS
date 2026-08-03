import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Dashboard } from '../pages/Dashboard';
import { ComplaintsList } from '../pages/ComplaintsList';
import { ComplaintDetails } from '../pages/ComplaintDetails';
import { ReportComplaint } from '../pages/ReportComplaint';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Layout containing Navbar & Sidebar wrap */}
      <Route path="/" element={<MainLayout />}>
        {/* Index path redirects to Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
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
