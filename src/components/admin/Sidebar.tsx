// src/components/admin/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { Home, Package, Users, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  return (
    <div className="w-64 bg-slate-800 text-white p-4 h-full">
      <div className="text-xl font-bold mb-8">Shop Admin</div>
      <nav className="space-y-2">
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => 
            cn("flex items-center gap-2 p-2 rounded hover:bg-slate-700", 
              isActive && "bg-slate-700")
          }
        >
          <Home size={18} /> Dashboard
        </NavLink>
        <NavLink 
          to="/admin/products" 
          className={({ isActive }) => 
            cn("flex items-center gap-2 p-2 rounded hover:bg-slate-700", 
              isActive && "bg-slate-700")
          }
        >
          <Package size={18} /> Products
        </NavLink>
        <NavLink 
          to="/admin/orders" 
          className={({ isActive }) => 
            cn("flex items-center gap-2 p-2 rounded hover:bg-slate-700", 
              isActive && "bg-slate-700")
          }
        >
          <ShoppingCart size={18} /> Orders
        </NavLink>
        <NavLink 
          to="/admin/customers" 
          className={({ isActive }) => 
            cn("flex items-center gap-2 p-2 rounded hover:bg-slate-700", 
              isActive && "bg-slate-700")
          }
        >
          <Users size={18} /> Customers
        </NavLink>
        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => 
            cn("flex items-center gap-2 p-2 rounded hover:bg-slate-700", 
              isActive && "bg-slate-700")
          }
        >
          <Settings size={18} /> Settings
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-slate-700">
          <NavLink 
            to="/" 
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-700"
          >
            <LogOut size={18} /> Back to Shop
          </NavLink>
        </div>
      </nav>
    </div>
  );
};