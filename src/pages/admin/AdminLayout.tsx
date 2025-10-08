// src/pages/admin/AdminLayout.tsx
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';

export const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  
  // Check if user is authenticated and has admin role
  if (isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};