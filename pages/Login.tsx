import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input } from '../components/ui/GlassComponents';
import { Lock, ScanFace, User, Info, AlertTriangle } from 'lucide-react';
import { faceAuthService } from '../lib/faceAuth';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface LoginProps {
  onDemoLogin?: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onDemoLogin }) => {
  const [mode, setMode] = useState<'password' | 'face'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'face') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => setError('无法访问摄像头'));
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [mode]);

  const enterDemoMode = () => {
    const demoUser: UserProfile = {
      id: 'demo-uuid',
      username: '管理员 (演示模式)',
      role_level: '00'
    };
    if (onDemoLogin) onDemoLogin(demoUser);
    navigate('/');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('账号或密码错误。如果是首次使用，请先在 Supabase 注册该用户并运行角色提升 SQL。');
        } else {
          throw authError;
        }
        return;
      }
      
      if (data.user) {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '无法连接至服务器，请检查网络或 Supabase 配置。');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const descriptor = await faceAuthService.getFaceDescriptor(videoRef.current!);
      if (!descriptor) throw new Error("未检测到面部");
      await new Promise(r => setTimeout(r, 1000));
      enterDemoMode();
    } catch (err: any) {
      setError(err.message || '面部识别失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px]" />

      <GlassCard className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center shadow-xl">
            <img src="https://i.ibb.co/vxq7QfYd/retouch-2025121423241826.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">棱镜管理系统</h2>
          <p className="text-xs opacity-40 uppercase tracking-widest mt-1">Intelligent Terminal</p>
        </div>

        <div className="flex w-full bg-black/5 p-1 rounded-xl">
          <button onClick={() => setMode('password')} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === 'password' ? 'bg-white shadow-sm text-black' : 'opacity-40')}>密码登录</button>
          <button onClick={() => setMode('face')} className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === 'face' ? 'bg-white shadow-sm text-black' : 'opacity-40')}>面部识别</button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="w-full space-y-4">
             <div className="relative">
               <User className="absolute left-3 top-3.5 w-5 h-5 opacity-30" />
               <Input type="email" placeholder="管理员邮箱" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
             </div>
             <div className="relative">
               <Lock className="absolute left-3 top-3.5 w-5 h-5 opacity-30" />
               <Input type="password" placeholder="访问密码" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} required />
             </div>

             {error && (
               <div className="text-xs p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 flex flex-col gap-2">
                 <div className="flex gap-2 items-center font-bold">
                   <AlertTriangle size={14} /> 登录受阻
                 </div>
                 <p>{error}</p>
               </div>
             )}

             <Button type="submit" className="w-full h-12" isLoading={loading}>安全进入</Button>
             
             <div className="mt-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <p className="text-[10px] text-blue-600 leading-relaxed">
                  <strong>初始配置提示：</strong><br/>
                  1. 请在 Supabase 控制台手动创建一个用户。<br/>
                  2. 建议账号: <code>admin@prism.com</code><br/>
                  3. 建议密码: <code>ss631204</code><br/>
                  4. 运行角色提升 SQL 将其设为 Lvl.00。
                </p>
             </div>

             <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-black/5"></div>
                <span className="flex-shrink mx-4 text-[10px] opacity-30 uppercase font-bold">或者</span>
                <div className="flex-grow border-t border-black/5"></div>
             </div>
             <Button type="button" variant="ghost" className="w-full" onClick={enterDemoMode}>
               以离线模式进入 (免登录预览)
             </Button>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-[var(--color-accent)]/30 shadow-2xl">
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
               <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-pulse" />
            </div>
            <p className="text-center text-xs opacity-50 max-w-[200px]">对准摄像头，系统将自动识别您的生物特征信息</p>
            {error && <div className="text-xs text-red-500">{error}</div>}
            <Button onClick={handleFaceLogin} className="w-full" isLoading={loading}>
               <ScanFace className="w-4 h-4" /> 开始扫描
            </Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Login;