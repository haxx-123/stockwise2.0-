import React, { useEffect, useState, PropsWithChildren, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, getSafeSession } from './lib/supabaseClient';
import { faceAuthService } from './lib/faceAuth';
import { ThemeProvider } from './lib/theme';
import { Layout } from './components/Layout';
import { UserProfile } from './types';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Logs from './pages/Logs';

// Splash Component
const Splash = ({ onComplete }: { onComplete: () => void }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceAuthService.loadModels(),
          new Promise(r => setTimeout(r, 2000))
        ]);
      } catch (e) {
        console.warn("Init background tasks failed:", e);
      } finally {
        setOpacity(0);
        setTimeout(onComplete, 500); 
      }
    };
    init();
  }, [onComplete]);

  return (
    <div 
      style={{ opacity, transition: 'opacity 0.5s ease-out' }}
      className="fixed inset-0 z-[100] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center"
    >
      <div className="w-24 h-24 mb-6 relative">
         <img 
           src="https://i.ibb.co/vxq7QfYd/retouch-2025121423241826.png" 
           alt="Prism Logo" 
           className="w-full h-full object-contain animate-pulse"
         />
      </div>
      <h1 className="text-2xl font-bold tracking-[0.2em] text-[var(--color-text-primary)]">PRISM</h1>
      <p className="text-xs mt-2 opacity-50 uppercase tracking-widest font-mono">Intelligent Terminal</p>
    </div>
  );
};

const ProtectedRoute = ({ children, user, loading }: PropsWithChildren<{ user: UserProfile | null, loading: boolean }>) => {
  if (loading) return null; // 正在检查 Session 时不渲染任何内容，防止闪现登录页
  if (!user) return <Navigate to="/login" replace />;
  return <Layout user={user}>{children}</Layout>;
};

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUser(data as UserProfile);
      } else {
        // 如果 profiles 表里还没这个用户，创建一个临时对象
        setUser({ 
          id: userId, 
          username: email?.split('@')[0] || 'User', 
          role_level: '05' 
        });
      }
    } catch (err) {
      console.warn("Fetch profile failed, using fallback user info.");
      setUser({ id: userId, username: email?.split('@')[0] || 'User', role_level: '05' });
    }
  }, []);

  useEffect(() => {
    // 1. 初始 Session 检查
    const checkInitialSession = async () => {
      const { session } = await getSafeSession();
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    };

    checkInitialSession();

    // 2. 监听 Auth 状态变化 (关键：处理登录成功后的自动跳转)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id, session.user.email);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <Login onDemoLogin={(u) => setUser(u)} />
        } />
        
        <Route path="/" element={
          <ProtectedRoute user={user} loading={loading}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute user={user} loading={loading}>
            <Inventory />
          </ProtectedRoute>
        } />

        <Route path="/logs" element={
          <ProtectedRoute user={user} loading={loading}>
            <Logs />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;