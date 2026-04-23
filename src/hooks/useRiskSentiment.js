import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useRiskSentiment = () => {
  const [sentiment, setSentiment] = useState({
    riskScore: 0,
    volatility: 0,
    trustMomentum: 100,
    latencyDelta: 0,
    activeThreats: 0,
    requestVelocity: 0 // requests per minute
  });

  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    if (!supabase) return;

    const analyzeSentiment = async () => {
      // 1. Fetch recent activity for velocity analysis
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      
      const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(50);

      const { data: alerts } = await supabase
        .from('anomaly_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (recentLogs) {
        // Calculate Request Velocity (RPM)
        const recentCount = recentLogs.filter(l => new Date(l.timestamp) > new Date(oneMinuteAgo)).length;
        
        // Calculate Trust Momentum (Successful grants vs Denials)
        const successful = recentLogs.filter(l => l.decision === 'allow' || l.decision === 'issued').length;
        const denied = recentLogs.filter(l => l.decision === 'deny' || l.decision === 'rejected').length;
        const momentum = recentLogs.length > 0 ? (successful / (successful + denied || 1)) * 100 : 100;

        // Calculate Latency Delta (Current Max - Current Min in recent window)
        const latencies = recentLogs.filter(l => l.total_latency_ms > 0).map(l => l.total_latency_ms);
        const delta = latencies.length > 1 ? Math.max(...latencies) - Math.min(...latencies) : 0;

        // Calculate Overall Risk Score (0-100)
        let risk = 0;
        risk += (alerts?.length || 0) * 10;
        risk += (denied * 5);
        risk += (recentCount > 10 ? 20 : 0); // High frequency penalty
        risk = Math.min(100, risk);

        // Update Ticker Feed
        const newTicker = recentLogs.map(l => ({
          id: l.id,
          type: l.event_type,
          hash: l.entry_hash || 'SHA256_HIDDEN',
          status: (l.decision === 'allow' || l.decision === 'issued') ? 'TRUSTED' : 'BLOCKED',
          timestamp: l.timestamp
        }));

        setSentiment({
          riskScore: risk,
          volatility: (delta / 100).toFixed(2),
          trustMomentum: Math.round(momentum),
          latencyDelta: Math.round(delta),
          activeThreats: alerts?.length || 0,
          requestVelocity: recentCount
        });

        setTickerData(newTicker);
      }
    };

    analyzeSentiment();
    const interval = setInterval(analyzeSentiment, 5000);

    const channel = supabase.channel('sentiment-engine')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, analyzeSentiment)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomaly_alerts' }, analyzeSentiment)
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { sentiment, tickerData };
};
