import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GlassCard, Button } from '../components/ui/GlassComponents';
import { OperationLog } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Undo2, AlertCircle } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('operation_logs')
      .select(`
        *,
        operator:profiles(username)
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setLogs(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRevoke = async (logId: string) => {
    if (!window.confirm("Are you sure you want to revert this operation? This will restore stock values.")) return;

    try {
      const { error } = await supabase.rpc('revoke_log', { p_log_id: logId });
      if (error) throw error;
      alert("Operation reverted successfully via Time Machine.");
      fetchLogs();
    } catch (err: any) {
      alert(`Failed to revert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-3xl font-bold">Audit Trail</h2>
         <p className="opacity-60">Time Machine Log - Revert any mistake.</p>
       </div>

       <div className="space-y-4">
          {logs.map((log, idx) => (
             <GlassCard key={log.id} className={`flex items-center justify-between p-4 ${log.is_revoked ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-start gap-4">
                   <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                      ${log.action_type === 'INBOUND' ? 'bg-green-500' : 
                        log.action_type === 'OUTBOUND' ? 'bg-orange-500' : 'bg-blue-500'}
                   `}>
                      {log.action_type.substring(0, 2)}
                   </div>
                   
                   <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{(log as any).operator?.username || 'Unknown'}</span>
                        <span className="text-xs opacity-50">performed</span>
                        <span className="font-mono text-xs bg-[var(--color-text-primary)]/5 px-1 py-0.5 rounded">{log.action_type}</span>
                      </div>
                      <div className="text-xs opacity-50 mt-1">
                         {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                      <div className="mt-2 text-sm font-mono">
                         Delta: L:{log.change_delta.quantity_large}, S:{log.change_delta.quantity_small}
                      </div>
                   </div>
                </div>

                <div>
                   {log.is_revoked ? (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-bold border border-red-500/20 px-2 py-1 rounded-full">
                         <AlertCircle size={12} /> REVOKED
                      </span>
                   ) : (
                      <Button variant="ghost" size="sm" onClick={() => handleRevoke(log.id)} className="text-xs h-8">
                         <Undo2 size={14} className="mr-1" /> Undo
                      </Button>
                   )}
                </div>
             </GlassCard>
          ))}
       </div>
    </div>
  );
};

export default Logs;
