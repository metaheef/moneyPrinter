import React, { useEffect, useState } from 'react';

export default function AlertBanner({ alerts }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const recent = alerts.slice(-3);
      setVisibleAlerts(recent);

      const timer = setTimeout(() => {
        // Since it's a simple toast system, we can just clear it or let a higher-level state handle it
        // We'll leave them if they are still in the alerts array, but we might want to auto-dismiss them from view
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 100
    }}>
      {visibleAlerts.map((alert, index) => (
        <div key={index} style={{
          backgroundColor: 'var(--bg-primary)',
          borderLeft: '4px solid var(--green-primary)',
          borderTop: 'var(--border)',
          borderRight: 'var(--border)',
          borderBottom: 'var(--border)',
          padding: '12px',
          animation: 'slide-in-right 0.3s ease-out',
          width: '300px',
          boxShadow: 'var(--glow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <strong className="glow-text">{alert.symbol}</strong>
            <span>Score: {alert.score.toFixed(0)}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            Top Signals: {alert.topSignals?.join(', ')}
          </div>
          {alert.score >= 85 && (
            <span className="badge badge-red" style={{ borderColor: 'yellow', color: 'yellow' }}>
              AUTO-TRADE
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
