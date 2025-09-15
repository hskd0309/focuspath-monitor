import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';
import AdminDashboard from './AdminDashboard';
import StudentManagement from './StudentManagement';
import DataManagement from './DataManagement';
import SystemSettings from './SystemSettings';
import AdminReports from './AdminReports';

const AdminLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'students':
        return <StudentManagement />;
      case 'data':
        return <DataManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Navigation
        userType="admin"
        userName="System Admin"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      <ChatBot />
    </div>
  );
};

export default AdminLayout;