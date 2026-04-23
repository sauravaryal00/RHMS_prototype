import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useThreatForecaster = (currentRisk = 0, velocity = 0) => {
  const [forecast, setForecast] = useState({
    predictedRisk: 0,
    threatProbability: 0,
    expectedAction: 'STABLE',
    insights: [],
    forecastChartData: []
  });

  const historyRef = useRef([]);

  useEffect(() => {
    // Maintain a history window of 10 points for regression
    historyRef.current = [...historyRef.current, currentRisk].slice(-10);
    
    const calculateForecast = () => {
      const history = historyRef.current;
      if (history.length < 3) return;

      // 1. Simple Linear Regression / Trend Analysis
      const first = history[0];
      const middle = history[Math.floor(history.length / 2)];
      const last = history[history.length - 1];
      
      const gradient = (last - first) / history.length;
      const acceleration = ((last - middle) - (middle - first)) / history.length;

      // Project 30 seconds ahead
      let projectedRisk = last + (gradient * 6) + (acceleration * 2);
      projectedRisk = Math.min(100, Math.max(0, Math.round(projectedRisk)));

      // 2. Threat Probability Heuristics
      let prob = 0;
      if (gradient > 2) prob += 30; // Rapidly rising risk
      if (velocity > 15) prob += 40; // High velocity
      if (projectedRisk > 70) prob += 30; // High projected risk
      prob = Math.min(99, prob);

      // 3. Expected Action (Sentiment)
      let action = 'STABLE';
      if (gradient > 5) action = 'CRITICAL_SPIKE_EXPECTED';
      else if (gradient < -2) action = 'SYSTEM_COOLING';
      else if (velocity > 10) action = 'HIGH_TRAFFIC_LOAD';

      // 4. Generate AI-like Insights
      const newInsights = [];
      if (prob > 70) newInsights.push({ type: 'CRITICAL', text: `High probability (${prob}%) of anomaly signature in T+45s.` });
      if (gradient > 3) newInsights.push({ type: 'WARNING', text: "Risk velocity is accelerating. Recommend policy tightening." });
      if (projectedRisk > last + 20) newInsights.push({ type: 'INFO', text: `Predicting ${projectedRisk}% tension peak within current window.` });
      
      if (newInsights.length === 0) {
        newInsights.push({ type: 'NOMINAL', text: "System trajectory remains within baseline boundaries." });
      }

      // 5. Build Forecast Chart Data (Actual vs Predicted)
      const chartPoints = history.map((val, i) => ({ t: i, actual: val, predicted: null }));
      // Add a dotted projection
      for (let i = 1; i <= 5; i++) {
        chartPoints.push({ 
          t: history.length + i, 
          actual: null, 
          predicted: Math.min(100, Math.max(0, last + (gradient * i) + (acceleration * (i/2))))
        });
      }

      setForecast({
        predictedRisk: projectedRisk,
        threatProbability: prob,
        expectedAction: action,
        insights: newInsights,
        forecastChartData: chartPoints
      });
    };

    const interval = setInterval(calculateForecast, 3000);
    calculateForecast(); // Initial run

    return () => clearInterval(interval);
  }, [currentRisk, velocity]);

  return forecast;
};
