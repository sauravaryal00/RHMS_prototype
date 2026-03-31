import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useAnomalyAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (supabase) {
      const fetchAlerts = async () => {
        const { data } = await supabase
          .from('anomaly_alerts')
          .select('*')
          .order('timestamp', { ascending: false });
        if (data) setAlerts(data);
      };
      
      fetchAlerts();

      const channel = supabase
        .channel('anomaly-alerts-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomaly_alerts' }, (payload) => {
          setAlerts(prev => [payload.new, ...prev]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const triggerAnomaly = async (ruleId, severity, details, patientId, requesterId) => {
    const newAlert = {
      rule_id: ruleId,
      severity,
      details,
      patient_id: patientId,
      requester_id: requesterId,
      timestamp: new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('anomaly_alerts').insert([newAlert]);
    } else {
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  return { alerts, triggerAnomaly };
};
