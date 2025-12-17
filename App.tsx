import React, { useEffect, useState, PropsWithChildren } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { faceAuthService } from './lib/faceAuth';
import { ThemeProvider } from './lib/theme';
import { Layout } from './components/Layout';
import { UserProfile } from './types';

// Pages
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Logs from './pages/Logs';

// Splash Component
const Splash = ({ onComplete }: { onComplete: () => void }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const init = async () => {
      // Parallel loading: Face models + Auth check
      await Promise.all([
        faceAuthService.loadModels(),
        new Promise(r => setTimeout(r, 2000)) // Min display time
      ]);
      setOpacity(0);
      setTimeout(onComplete, 500); // Wait for fade out
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
      <p className="text-xs mt-2 opacity-50">Intelligent Inventory System</p>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children, user }: PropsWithChildren<{ user: UserProfile | null }>) => {
  if (!user) return <Navigate to="/login" replace />;
  return <Layout user={user}>{children}</Layout>;
};

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
         // In real app, fetch profile joined data here
         const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         if (data) {
           setUser(data as UserProfile);
         } else {
           // Fallback for mock/demo if profile doesn't exist
           setUser({ 
             id: session.user.id, 
             username: session.user.email?.split('@')[0] || 'User', 
             role_level: '05' 
           });
         }
      }
      setLoading(false);
    };
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (session?.user) {
          // Simplified re-fetch logic
          setUser({ 
             id: session.user.id, 
             username: session.user.email?.split('@')[0] || 'User', 
             role_level: '05' 
           });
       } else {
         setUser(null);
       }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute user={user}>
            <div className="text-center p-10 opacity-50">Dashboard Overview (WIP)</div>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute user={user}>
            <Inventory />
          </ProtectedRoute>
        } />

        <Route path="/logs" element={
          <ProtectedRoute user={user}>
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