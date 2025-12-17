import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Palette
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../lib/theme';
import { GlassCard, Badge } from './ui/GlassComponents';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
}

const Sidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  user: UserProfile | null;
  toggleTheme: () => void;
}> = ({ isOpen, onClose, user, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: History, label: 'Logs', path: '/logs' },
  ];

  if (user?.role_level === '00') {
    navItems.push({ icon: Settings, label: 'Connection', path: '/connection' });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-out glass border-r border-white/20 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 shadow-inner" />
            <h1 className="font-bold text-xl tracking-tight">Prism</h1>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-md hover:bg-black/5">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-black/5">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white/50">
               {/* Avatar placeholder */}
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="avatar" />
             </div>
             <div className="flex flex-col">
                <span className="font-semibold text-sm">{user?.username}</span>
                {user && <Badge role={user.role_level} />}
             </div>
           </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 768 && onClose()}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-[var(--color-accent)] text-white shadow-md" 
                  : "hover:bg-[var(--color-text-primary)]/5"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-text-primary)]/5 transition-colors"
          >
            <Palette size={20} />
            <span>Switch Theme</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex text-[var(--color-text-primary)]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300">
        <div className="md:hidden mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
             Prism StockWise
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg glass active:scale-95 transition-transform"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
