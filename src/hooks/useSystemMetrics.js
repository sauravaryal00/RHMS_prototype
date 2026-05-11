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
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/system/metrics');
        if (!response.ok) throw new Error('Backend not responding');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setExperimentResults(data);
          
          // Calculate average metrics
          const securitySum = data.reduce((acc, curr) => acc + parseInt(curr.security_score || 0), 0);
          setMetrics(prev => ({ ...prev, securityScore: Math.round(securitySum / data.length) }));
          
          const latencySum = data.reduce((acc, curr) => acc + parseFloat(curr.avg_latency_ms || 0), 0);
          setMetrics(prev => ({ ...prev, avgLatency: Math.round(latencySum / data.length) }));
          
          const errors = data.reduce((acc, curr) => acc + parseFloat(curr.error_rate || 0), 0);
          setMetrics(prev => ({ ...prev, errorRate: Math.round(errors / data.length) }));
          
          setMetrics(prev => ({ 
            ...prev, 
            totalRequests: data.reduce((acc, curr) => acc + parseInt(curr.requests || 0), 0),
            blockedAttempts: data.reduce((acc, r) => acc + parseInt(r.failure || 0), 0)
          }));
        }
      } catch (err) {
        console.warn("Metrics Fetch Error:", err.message);
        // Fallback or keep defaults
      }
    };

    fetchLocalMetrics();
    const interval = setInterval(fetchLocalMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return { ...metrics, experimentResults };
};
