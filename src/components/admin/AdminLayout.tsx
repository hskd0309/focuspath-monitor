import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';
import AdminDashboard from './AdminDashboard';
import AdminStudentManagement from './AdminStudentManagement';
import AdminDataManagement from './AdminDataManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import AdminReports from './AdminReports';

const AdminLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onPageChange={setCurrentPage} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'students':
        return <AdminStudentManagement />;
      case 'staff':
        return <AdminDataManagement />;
      case 'settings':
        return <AdminSettings />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminDashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Navigation
        userType="admin"
        userName="ADMIN001"
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