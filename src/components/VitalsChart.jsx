import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const VitalsChart = ({ data, dataKey, color, title, unit, min = 0, max = 200 }) => {
  return (
    <div className="glass p-6 rounded-2xl h-64 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{title}</h3>
        <div className="text-xl font-bold font-mono text-text-primary">
          {data.length > 0 ? data[data.length - 1][dataKey] : '--'} 
          <span className="text-[10px] text-muted ml-1 uppercase">{unit}</span>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              hide={true}
            />
            <YAxis 
              domain={[min, max]} 
              hide={true} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${dataKey})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VitalsChart;
