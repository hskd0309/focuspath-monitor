import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';
import AdminDashboard from './AdminDashboard';
import AdminStudentManagement from './AdminStudentManagement';
import AdminReports from './AdminReports';

const AdminLayout: React.FC = () => {
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminStudentManagement />;
      case 'reports':
        return <AdminReports />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        userType="admin"
        userName={profile?.full_name || "ADMIN001"}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main className="pt-16">
        {renderPage()}
      </main>
      <ChatBot />
    </div>
  );
};

export default AdminLayout;