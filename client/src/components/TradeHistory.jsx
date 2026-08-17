import React, { useState } from 'react';

export default function TradeHistory({ trades, network }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  
  const start = page * itemsPerPage;
  const paginatedTrades = trades?.slice(start, start + itemsPerPage) || [];
  const totalPages = Math.ceil((trades?.length || 0) / itemsPerPage);

  return (
    <div className="panel" style={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        TRADE HISTORY
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {trades && trades.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: 'var(--border)', textAlign: 'left', color: 'var(--text-dim)' }}>
                <th style={{ padding: '8px' }}>#</th>
                <th>Time</th>
                <th>Pair</th>
                <th>In</th>
                <th>Out</th>
                <th>P&L</th>
                <th>Status</th>
                <th>Tx</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((t, i) => (
                <tr key={t.id || i} className="table-row" style={{ borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
                  <td style={{ padding: '8px' }}>{start + i + 1}</td>
                  <td>{new Date(t.timestamp).toLocaleTimeString()}</td>
                  <td>{t.pair}</td>
                  <td>{t.inputAmount}</td>
                  <td>{t.outputAmount}</td>
                  <td className={t.pnl >= 0 ? 'positive' : 'negative'}>
                    {t.pnl >= 0 ? '+' : ''}{t.pnl}
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'failed' ? 'badge-red' : ''}`} style={{
                      borderColor: t.status === 'pending' ? 'yellow' : '',
                      color: t.status === 'pending' ? 'yellow' : ''
                    }}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <a 
                      href={`https://solscan.io/tx/${t.txHash}?cluster=${network}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.txHash?.substring(0, 4)}...
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            NO TRADES YET. GO PRINT MONEY.
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ padding: '10px', borderTop: 'var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>PREV</button>
          <span>{page + 1} / {totalPages}</span>
          <button className="btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>NEXT</button>
        </div>
      )}
    </div>
  );
}
