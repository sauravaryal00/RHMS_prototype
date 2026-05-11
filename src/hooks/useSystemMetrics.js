// useSystemMetrics.js — v2 (fixed fetchData reference, build: 2026-05-11)
import { useState, useEffect } from 'react';

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
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/system/metrics');
        if (!response.ok) throw new Error('Backend offline');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setExperimentResults(data);
          const securitySum = data.reduce((acc, curr) => acc + parseInt(curr.security_score || 0), 0);
          const latencySum  = data.reduce((acc, curr) => acc + parseFloat(curr.avg_latency_ms || 0), 0);
          const errorSum    = data.reduce((acc, curr) => acc + parseFloat(curr.error_rate || 0), 0);
          const totalReq    = data.reduce((acc, curr) => acc + parseInt(curr.requests || 0), 0);
          const blocked     = data.reduce((acc, r)    => acc + parseInt(r.failure || 0), 0);

          setMetrics({
            securityScore:  Math.round(securitySum / data.length),
            avgLatency:     Math.round(latencySum  / data.length),
            errorRate:      Math.round(errorSum    / data.length),
            totalRequests:  totalReq,
            blockedAttempts: blocked
          });
        }
      } catch {
        // Backend offline — keep default values, no crash
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return { ...metrics, experimentResults };
};
