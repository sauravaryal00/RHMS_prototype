import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { mockVitals } from '../utils/mockData';

export const useRealtimeVitals = (patientId) => {
  const [vitals, setVitals] = useState(mockVitals);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!supabase) {
      // Fallback to simulation if Supabase is not configured
      const interval = setInterval(() => {
        const newVitals = {
          ...mockVitals,
          timestamp: new Date().toISOString(),
          hr: Math.round(72 + Math.random() * 15),
          bp_sys: Math.round(115 + Math.random() * 15),
          bp_dia: Math.round(75 + Math.random() * 10),
          spo2: parseFloat((96 + Math.random() * 3.5).toFixed(1))
        };
        setVitals(newVitals);
        setHistory(prev => [...prev, newVitals].slice(-60));
      }, 2000);
      return () => clearInterval(interval);
    }

    // Real Supabase Implementation
    const fetchVitals = async () => {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('timestamp', { ascending: false })
        .limit(60);

      if (data) {
        setVitals(data[0] || mockVitals);
        setHistory(data.reverse());
      }
    };

    fetchVitals();

    // Subscribe to real-time updates
    const channel = supabase
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

    // Local Simulation Listener (for demo fallback)
    const handleLocalUpdate = (e) => {
      setVitals(e.detail);
      setHistory(prev => [...prev, e.detail].slice(-60));
    };
    window.addEventListener('local-vitals-update', handleLocalUpdate);

    return () => {
      supabase?.removeChannel(channel);
      window.removeEventListener('local-vitals-update', handleLocalUpdate);
    };
  }, [patientId]);

  return { vitals, history, connectionStatus: supabase ? 'Connected (Cloud)' : 'Simulated', protocol: 'WSS/TLS', port: 443 };
};
