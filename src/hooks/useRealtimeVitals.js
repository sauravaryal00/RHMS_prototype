import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { mockVitals } from '../utils/mockData';

export const useRealtimeVitals = (patientId) => {
  const [vitals, setVitals] = useState(mockVitals);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 1. Local listener MUST be first and ALWAYS active
    const handleLocalUpdate = (e) => {
      console.log('HOOK_LOCAL_SYNC:', e.detail.hr);
      setVitals(e.detail);
      setHistory(prev => [...prev, e.detail].slice(-60));
    };
    window.addEventListener('local-vitals-update', handleLocalUpdate);

    // 2. Fetch Initial Data
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

    // 3. Cloud Subscription (if available)
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
    } else {
      // Internal Mock Loop (Global fallback)
      const mockInterval = setInterval(() => {
        const dummy = {
          ...mockVitals,
          timestamp: new Date().toISOString(),
          hr: Math.round(72 + Math.random() * 10),
          bp_sys: Math.round(110 + Math.random() * 5),
          spo2: parseFloat((97 + Math.random() * 2).toFixed(1))
        };
        setVitals(dummy);
        setHistory(prev => [...prev, dummy].slice(-60));
      }, 5000);
      return () => {
        clearInterval(mockInterval);
        window.removeEventListener('local-vitals-update', handleLocalUpdate);
      };
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('local-vitals-update', handleLocalUpdate);
    };
  }, [patientId]);

  return { vitals, history, connectionStatus: supabase ? 'Connected (Cloud)' : 'Local Demo', protocol: 'WSS/TLS', port: 443 };
};
