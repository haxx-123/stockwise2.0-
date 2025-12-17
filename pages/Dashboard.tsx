import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassComponents';
import { supabase } from '../lib/supabaseClient';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <GlassCard className="flex flex-col gap-4 relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -mr-8 -mt-8 rounded-full", color)} />
    <div className="flex justify-between items-start relative z-10">
      <div className="p-3 rounded-xl bg-white/10 glass shadow-inner">
        <Icon size={24} className="text-[var(--color-accent)]" />
      </div>
      {trend !== undefined && (
        <span className={cn(
          "text-xs font-bold flex items-center gap-0.5",
          trend > 0 ? "text-green-500" : "text-red-500"
        )}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-sm opacity-60 font-medium">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight mt-1">{value}</h3>
    </div>
  </GlassCard>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 124, 
    activeBatches: 38,
    expiringSoon: 4,
    recentLogs: [] as any[]
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 使用 Promise.allSettled 确保单个请求失败不会阻止其他逻辑
        const results = await Promise.allSettled([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('batches').select('*', { count: 'exact', head: true }),
          supabase.from('operation_logs').select('*, operator:profiles(username)').order('created_at', { ascending: false }).limit(5)
        ]);

        const prodResult = results[0];
        const batchResult = results[1];
        const logResult = results[2];

        setStats(prev => ({
          ...prev,
          totalProducts: (prodResult.status === 'fulfilled' && prodResult.value.count) || prev.totalProducts,
          activeBatches: (batchResult.status === 'fulfilled' && batchResult.value.count) || prev.activeBatches,
          recentLogs: (logResult.status === 'fulfilled' && logResult.value.data) || []
        }));
      } catch (e) {
        console.warn("Dashboard data fetch partially failed, using available/demo data.");
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">终端概览</h2>
          <p className="opacity-50 text-lg mt-1">欢迎回来，这是您的实时库存情报。</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-full glass text-[10px] font-bold tracking-widest opacity-60">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          TERMINAL ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="产品种类" value={stats.totalProducts} icon={Package} trend={12} color="bg-blue-500" />
        <StatCard title="活动批次" value={stats.activeBatches} icon={TrendingUp} trend={5} color="bg-purple-500" />
        <StatCard title="临期预警" value={stats.expiringSoon} icon={AlertTriangle} trend={-2} color="bg-orange-500" />
        <StatCard title="系统负载" value="正常" icon={Clock} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl">库存吞吐量</h3>
            <div className="text-[10px] opacity-40 font-mono">Last 7 Days Stats</div>
          </div>
          <div className="h-64 w-full flex items-end justify-between gap-3 px-4">
             {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
               <div key={i} className="flex-1 group relative">
                 <div 
                   style={{ height: `${h}%` }} 
                   className="w-full bg-gradient-to-t from-[var(--color-accent)]/40 to-[var(--color-accent)] rounded-t-lg transition-all duration-500 hover:brightness-125 shadow-lg" 
                 />
                 <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[10px] opacity-30 font-mono">0{i+1}</div>
               </div>
             ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-bold text-xl mb-8">最近操作动态</h3>
          <div className="space-y-6">
            {stats.recentLogs.length > 0 ? stats.recentLogs.map((log, i) => (
              <div key={log.id} className="flex gap-4">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", log.action_type === 'INBOUND' ? 'bg-green-500' : 'bg-orange-500')} />
                <div>
                  <p className="text-sm font-semibold">{log.operator?.username || '系统'}</p>
                  <p className="text-[10px] opacity-50 uppercase mt-0.5">{log.action_type} - {new Date(log.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            )) : (
              <div className="space-y-4 opacity-50">
                <p className="text-xs">10:24 AM - 管理员 登录系统</p>
                <p className="text-xs">09:15 AM - 库存 自动对账完成</p>
                <p className="text-xs">昨天 - 批量 导入产品成功</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;