import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PnLChart({ trades }) {
  const [range, setRange] = useState('ALL');

  const data = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    let cumPnl = 0;
    const sorted = [...trades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return sorted.map(t => {
      cumPnl += (t.pnl || 0);
      return {
        time: new Date(t.timestamp).toLocaleTimeString(),
        pnl: cumPnl
      };
    });
  }, [trades]);

  return (
    <div className="panel" style={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header" style={{ borderBottom: 'none' }}>
        <span>CUMULATIVE P&L</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['24H', '7D', 'ALL'].map(r => (
            <button 
              key={r}
              className={`btn ${range === r ? 'btn-primary' : ''}`}
              style={{ padding: '2px 6px', fontSize: '0.8rem' }}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--green-border)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-panel)', border: 'var(--border)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area 
                type="monotone" 
                dataKey="pnl" 
                stroke="var(--green-primary)" 
                fillOpacity={1} 
                fill="url(#colorPnl)" 
              />
              <defs>
                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--green-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            NO P&L DATA
          </div>
        )}
      </div>
    </div>
  );
}
