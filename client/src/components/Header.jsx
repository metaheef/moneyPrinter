import React from 'react';

export default function Header({ solPrice, network, isConnected, children }) {
  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: 'var(--border)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      gridColumn: '1 / -1'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
        <span className="glow-text" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          MONEY PRINTER
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {solPrice && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>SOL: ${solPrice.toFixed(2)}</span>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: 'var(--green-primary)',
              animation: 'pulse-green 2s infinite'
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {network === 'devnet' && (
          <span style={{ fontSize: '0.8rem', color: 'orange' }}>
            🚰 Get devnet SOL: faucet.solana.com
          </span>
        )}
        <span className="badge" style={{ 
          borderColor: network === 'devnet' ? 'orange' : 'var(--green-primary)',
          color: network === 'devnet' ? 'orange' : 'var(--green-primary)'
        }}>
          {network ? network.toUpperCase() : 'UNKNOWN'}
        </span>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          backgroundColor: isConnected ? 'var(--green-primary)' : 'var(--red)'
        }} title={isConnected ? 'WS Connected' : 'WS Disconnected'} />
        {children}
      </div>
    </div>
  );
}
