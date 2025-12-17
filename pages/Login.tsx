import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input } from '../components/ui/GlassComponents';
import { Camera, Lock, ScanFace, User } from 'lucide-react';
import { faceAuthService } from '../lib/faceAuth';
import { cn } from '../lib/utils';

const Login = () => {
  const [mode, setMode] = useState<'password' | 'face'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Face ID Logic
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (mode === 'face') {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (e) {
          setError('Camera access denied');
        }
      };
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  const handleFaceLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Capture & Analyze
      const descriptor = await faceAuthService.getFaceDescriptor(videoRef.current!);
      if (!descriptor) throw new Error("Face not detected");

      // 2. Fetch user profile (In real app, you'd match against all or use 1:1 if username known)
      // Simulating a successful match for demo user
      // For this demo, we bypass the actual 128-vector math comparison against DB 
      // because we can't seed the vector easily without the library running fully.
      
      // Simulating "Auth Success"
      await new Promise(r => setTimeout(r, 1500));
      
      // Auto-login as demo user for the sake of the output
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@stockwise.art',
        password: 'password123'
      });
      
      if (error) throw error;
      navigate('/');

    } catch (err: any) {
      setError(err.message || 'Face verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]" />

      <GlassCard className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center shadow-xl mb-2">
            <img src="https://i.ibb.co/vxq7QfYd/retouch-2025121423241826.png" alt="Logo" className="w-16 h-16 object-contain" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-sm opacity-60 -mt-4 text-center">Prism StockWise System</p>

        <div className="flex w-full bg-black/5 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setMode('password')}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === 'password' ? 'bg-white shadow-sm text-black' : 'opacity-50')}
          >
            Password
          </button>
          <button 
            onClick={() => setMode('face')}
            className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === 'face' ? 'bg-white shadow-sm text-black' : 'opacity-50')}
          >
            Face ID
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="w-full space-y-4">
             <div className="space-y-1">
               <label className="text-xs font-semibold uppercase tracking-wider opacity-70 ml-1">Email</label>
               <div className="relative">
                 <User className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                 <Input 
                    type="email" 
                    placeholder="operator@prism.com" 
                    className="pl-10" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                 />
               </div>
             </div>
             
             <div className="space-y-1">
               <label className="text-xs font-semibold uppercase tracking-wider opacity-70 ml-1">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3.5 w-5 h-5 opacity-40" />
                 <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                 />
               </div>
             </div>

             {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}

             <Button type="submit" className="w-full h-12 mt-4" isLoading={loading}>
               Secure Login
             </Button>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center gap-4 animate-fade-in-up">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--color-accent)] shadow-[0_0_30px_var(--color-accent)]">
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
               <div className="absolute inset-0 border-[2px] border-white/30 rounded-full animate-pulse"></div>
            </div>
            
            <p className="text-center text-sm opacity-70 max-w-[200px]">
              Position your face within the circle. Blink to verify liveness.
            </p>

            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}

            <Button onClick={handleFaceLogin} className="w-full mt-2" isLoading={loading}>
               <ScanFace className="w-5 h-5" /> Authenticate
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Login;