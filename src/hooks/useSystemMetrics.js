import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState({
    avgLatency: 0,
    securityScore: 100,
    errorRate: 0,
    totalRequests: 0,
    blockedAttempts: 0
  });

  const [experimentResults, setExperimentResults] = useState([]);

  useEffect(() => {
    const fetchLocalMetrics = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:8000/system/metrics');
        const data = await resp.json();
        if (Array.isArray(data)) {
          setExperimentResults(data);
          
          // Map to summary metrics for existing components
          const normal = data.find(r => r.test_name === "Normal Access");
          if (normal) {
            setMetrics(prev => ({
              ...prev,
              avgLatency: parseFloat(normal.avg_latency_ms),
              totalRequests: data.reduce((acc, r) => acc + parseInt(r.requests), 0),
              blockedAttempts: data.reduce((acc, r) => acc + parseInt(r.failure), 0)
            }));
          }
        }
      } catch (err) {
        console.error("Local backend not connected for metrics:", err);
      }
    };

    fetchLocalMetrics();
    const interval = setInterval(fetchLocalMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return { ...metrics, experimentResults };
};
