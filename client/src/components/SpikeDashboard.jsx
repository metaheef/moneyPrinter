import React from 'react';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default function SpikeDashboard({ priceHistory, solPrice, scores, autoTradeEnabled, onToggleAutoTrade, threshold }) {
  // Backend returns scores as { [mint]: { score, signals, timestamp } }
  const solScoreData = scores?.[SOL_MINT] || {};
  const score = solScoreData.score ?? 0;
  const signals = solScoreData.signals ?? [];
  const lastUpdated = solScoreData.timestamp ? new Date(solScoreData.timestamp).toLocaleTimeString() : '—';

  const isHigh = score >= 75;
  const isMid = score >= 40 && score < 75;
  const scoreColor = isHigh ? 'var(--red)' : isMid ? '#ffcc00' : 'var(--green-primary)';

  const signalKeys = ['RSI', 'MACD', 'BB', 'Volume', 'ROC'];

  return (
    <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          ⚡ Spike Predictor
        </span>
      </div>

      {/* Score Card */}
      <div className="panel" style={{ marginBottom: '14px' }}>
        <div className="panel-header">
          <span>SOL / USDC</span>
          <span style={{ color: 'var(--text-white)' }}>
            ${typeof solPrice === 'number' ? solPrice.toFixed(2) : '—'}
          </span>
        </div>
        <div style={{ padding: '16px' }}>
          {/* Big Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>SPIKE SCORE</span>
            <span style={{
              fontSize: '2.6rem',
              fontWeight: '800',
              color: scoreColor,
              textShadow: `0 0 20px ${scoreColor}`,
              lineHeight: 1
            }}>
              {score}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%', height: '6px',
            backgroundColor: 'rgba(0,255,65,0.1)',
            borderRadius: '3px',
            marginBottom: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(0,255,65,0.2)'
          }}>
            <div style={{
              width: `${score}%`,
              height: '100%',
              background: `linear-gradient(90deg, var(--green-primary), ${scoreColor})`,
              borderRadius: '3px',
              transition: 'width 0.6s ease',
              boxShadow: `0 0 8px ${scoreColor}`
            }} />
          </div>

          {/* Signal Badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {signalKeys.map(key => {
              const active = signals.some(s => s.toLowerCase().includes(key.toLowerCase()));
              return (
                <span key={key} style={{
                  padding: '3px 10px',
                  border: `1px solid ${active ? 'var(--green-primary)' : 'rgba(0,255,65,0.2)'}`,
                  borderRadius: '2px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  color: active ? 'var(--green-primary)' : 'var(--text-dim)',
                  boxShadow: active ? '0 0 6px rgba(0,255,65,0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {key}
                </span>
              );
            })}
          </div>

          {/* Active Signals List */}
          {signals.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              {signals.map((sig, i) => (
                <div key={i} style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  padding: '2px 0',
                  borderBottom: '1px solid rgba(0,255,65,0.05)'
                }}>
                  › {sig}
                </div>
              ))}
            </div>
          )}

          {/* Sparkline */}
          <div style={{
            height: '56px', width: '100%',
            border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: '2px',
            padding: '4px',
            backgroundColor: 'rgba(0,255,65,0.03)',
            marginBottom: '8px'
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {priceHistory && priceHistory.length > 1 && (() => {
                const pts = priceHistory.slice(-30);
                const min = Math.min(...pts);
                const max = Math.max(...pts);
                const range = max === min ? 1 : max - min;
                const points = pts.map((p, i) => {
                  const x = (i / (pts.length - 1)) * 100;
                  const y = 100 - ((p - min) / range) * 90 - 5;
                  return `${x},${y}`;
                }).join(' ');
                return <polyline fill="none" stroke="var(--green-primary)" strokeWidth="2" points={points} />;
              })()}
            </svg>
          </div>

          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'right' }}>
            Updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Auto-Trade Toggle */}
      <div className="panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: '700', marginBottom: '4px', letterSpacing: '1px' }}>
            🤖 AUTO-TRADE
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            FIRES WHEN SCORE ≥ {threshold}
          </div>
        </div>
        <button
          id="auto-trade-toggle"
          className={`btn ${autoTradeEnabled ? 'btn-primary' : ''}`}
          onClick={onToggleAutoTrade}
          style={{
            padding: '8px 18px',
            fontWeight: '700',
            letterSpacing: '1px',
            boxShadow: autoTradeEnabled ? '0 0 12px rgba(0,255,65,0.4)' : 'none'
          }}
        >
          {autoTradeEnabled ? '● ACTIVE' : '○ INACTIVE'}
        </button>
      </div>
    </div>
  );
}
