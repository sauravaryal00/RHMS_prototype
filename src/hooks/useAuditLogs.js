import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (supabase) {
      const fetchLogs = async () => {
        const { data } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        if (data) setLogs(data);
      };
      fetchLogs();

      const channel = supabase
        .channel('audit-logs-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
          setLogs(prev => [payload.new, ...prev]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const addLog = async (event) => {
    // simple hash-chain simulation for prototype
    const prevLog = logs[0];
    const prevHash = prevLog ? prevLog.entry_hash : '0000000000000000';
    const entryHash = Math.random().toString(36).substring(2, 15); // In prod, use window.crypto.subtle

    const newLog = {
      ...event,
      prev_hash: prevHash,
      entry_hash: entryHash,
      timestamp: new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('audit_logs').insert([newLog]);
    }
  };

  return { logs, addLog };
};
