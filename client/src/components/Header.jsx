import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Header({ solPrice, network, isConnected, children }) {
  const { connected, publicKey, disconnect } = useWallet();

  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#000',
      borderBottom: '1px solid rgba(0,255,65,0.3)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      gridColumn: '1 / -1',
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Left — Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <img src="/logo.png" alt="Logo" style={{ height: '34px', flexShrink: 0 }} />
        <span className="glow-text" style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
          MONEY PRINTER
        </span>
      </div>

      {/* Center — SOL Price */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {solPrice > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-white)' }}>
              SOL <span style={{ color: 'var(--green-primary)', fontWeight: '700' }}>${solPrice.toFixed(2)}</span>
            </span>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: 'var(--green-primary)',
              animation: 'pulse-green 2s infinite',
              boxShadow: '0 0 6px var(--green-primary)',
            }} />
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>fetching price...</span>
        )}
      </div>

      {/* Right — Status + Wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Devnet faucet hint */}
        {network === 'devnet' && (
          <a
            href="https://faucet.solana.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.7rem', color: 'orange', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            🚰 faucet.solana.com
          </a>
        )}

        {/* Network badge */}
        <span style={{
          padding: '3px 8px',
          border: `1px solid ${network === 'devnet' ? 'orange' : 'var(--green-primary)'}`,
          borderRadius: '3px',
          fontSize: '0.65rem',
          fontWeight: '700',
          letterSpacing: '1px',
          color: network === 'devnet' ? 'orange' : 'var(--green-primary)',
          whiteSpace: 'nowrap',
        }}>
          {(network || 'UNKNOWN').toUpperCase()}
        </span>

        {/* WebSocket status dot */}
        <div
          title={isConnected ? 'Backend connected' : 'Backend disconnected'}
          style={{
            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: isConnected ? 'var(--green-primary)' : 'var(--red)',
            boxShadow: isConnected ? '0 0 6px var(--green-primary)' : '0 0 6px var(--red)',
          }}
        />

        {/* Wallet status — shown alongside the adapter button */}
        {connected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Green pill showing connected address */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              border: '1px solid var(--green-primary)',
              borderRadius: '3px',
              backgroundColor: 'rgba(0,255,65,0.08)',
              boxShadow: '0 0 8px rgba(0,255,65,0.2)',
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                backgroundColor: 'var(--green-primary)',
                boxShadow: '0 0 6px var(--green-primary)',
                animation: 'pulse-green 2s infinite',
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--green-primary)', fontFamily: 'var(--font-mono)' }}>
                {shortKey}
              </span>
            </div>
            <button
              onClick={disconnect}
              style={{
                background: 'none',
                border: '1px solid rgba(255,51,51,0.4)',
                color: 'var(--red)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                padding: '4px 8px',
                cursor: 'pointer',
                borderRadius: '3px',
                letterSpacing: '1px',
              }}
            >
              DISCONNECT
            </button>
          </div>
        ) : (
          // Not connected — render the wallet adapter button with visible green styling
          <div style={{
            '--wallet-adapter-button-start-icon-display': 'none',
          }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
