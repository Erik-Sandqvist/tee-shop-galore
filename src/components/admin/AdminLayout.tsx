// src/components/admin/AdminLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};