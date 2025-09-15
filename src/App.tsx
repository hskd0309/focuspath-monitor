import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import StudentLayout from "./components/student/StudentLayout";
import StaffLayout from "./components/staff/StaffLayout";
import CounsellorLayout from "./components/counsellor/CounsellorLayout";
import AdminLayout from "./components/admin/AdminLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { profile } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={profile ? <Navigate to={`/${profile.role}`} replace /> : <Login />} />
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff" 
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffLayout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/counsellor" 
        element={
          <ProtectedRoute allowedRoles={['counsellor']}>
            <CounsellorLayout />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
