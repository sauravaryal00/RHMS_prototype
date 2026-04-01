import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { mockVitals } from '../utils/mockData';

export const useRealtimeVitals = (patientId) => {
  const [vitals, setVitals] = useState(mockVitals);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 1. Initial Data Fetch
    const fetchVitals = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('timestamp', { ascending: false })
        .limit(60);

      if (data && data.length > 0) {
        setVitals(data[0]);
        setHistory(data.reverse());
      }
    };
    fetchVitals();

    // 2. Real-time Subscription (Postgres)
    let channel;
    if (supabase) {
      channel = supabase
        .channel('vitals-realtime')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'vitals',
          filter: `patient_id=eq.${patientId}`
        }, (payload) => {
          setVitals(payload.new);
          setHistory(prev => [...prev, payload.new].slice(-60));
        })
        .subscribe();
    }

    // 3. Local Mock Listener (Triggered ONLY by Simulation Button)
    const handleLocalUpdate = (e) => {
      setVitals(e.detail);
      setHistory(prev => [...prev, e.detail].slice(-60));
    };
    window.addEventListener('local-vitals-update', handleLocalUpdate);

    return () => {
      if (channel) supabase?.removeChannel(channel);
      window.removeEventListener('local-vitals-update', handleLocalUpdate);
    };
  }, [patientId]);

  return { vitals, history, connectionStatus: supabase ? 'Connected (Cloud)' : 'Local Demo', protocol: 'WSS/TLS', port: 443 };
};
