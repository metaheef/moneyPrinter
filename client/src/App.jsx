import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { clusterApiUrl } from '@solana/web3.js'

import Header from './components/Header'
import AlertBanner from './components/AlertBanner'
import SpikeDashboard from './components/SpikeDashboard'
import TradeHistory from './components/TradeHistory'
import PnLChart from './components/PnLChart'
import JupiterPanel from './components/JupiterPanel'
import { useWebSocket } from './hooks/useWebSocket'

function AppContent() {
  const walletContextState = useWallet()
  const { lastMessage, isConnected } = useWebSocket('ws://localhost:3001')
  
  const [trades, setTrades] = useState([])
  const [scores, setScores] = useState({})
  const [alerts, setAlerts] = useState([])
  const [network] = useState('devnet')
  const [solPrice, setSolPrice] = useState(0)
  const [priceHistory, setPriceHistory] = useState([])
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false)

  const rpcUrl = clusterApiUrl('devnet')

  useEffect(() => {
    fetch('/api/trades').then(res => res.json()).then(data => setTrades(data)).catch(() => {})
    fetch('/api/scores').then(res => res.json()).then(data => setScores(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!lastMessage) return;
    
    if (lastMessage.type === 'price_update') {
      const price = lastMessage.data?.price_usd ?? 0
      setSolPrice(price)
      setPriceHistory(prev => [...prev, price].slice(-50))
    } else if (lastMessage.type === 'spike_alert') {
      setAlerts(prev => [lastMessage.data, ...prev].slice(0, 10))
    } else if (lastMessage.type === 'welcome') {
      // Seed initial alerts
      if (lastMessage.data?.alerts) {
        setAlerts(lastMessage.data.alerts)
      }
    }
  }, [lastMessage])

  const handleTradeSuccess = useCallback(async (txData) => {
    try {
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      // Refresh trades
      const res = await fetch('/api/trades');
      const data = await res.json();
      setTrades(data);
    } catch (e) {
      console.error('Failed to save trade', e);
    }
  }, []);

  const handleToggleAutoTrade = useCallback(async () => {
    try {
      const newVal = !autoTradeEnabled;
      setAutoTradeEnabled(newVal);
      await fetch('/api/auto-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newVal })
      });
    } catch (e) {
      console.error('Failed to toggle auto trade', e);
      setAutoTradeEnabled(prev => !prev);
    }
  }, [autoTradeEnabled]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '60px 1fr',
      gridTemplateColumns: '35% 35% 30%',
      height: '100vh',
      gap: 0
    }}>
      <Header solPrice={solPrice} network={network} isConnected={isConnected}>
        <WalletMultiButton style={{
          backgroundColor: 'transparent',
          border: '1px solid var(--green-primary)',
          color: 'var(--green-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: '700',
          letterSpacing: '1px',
          padding: '6px 14px',
          height: '34px',
          borderRadius: '3px',
          boxShadow: '0 0 8px rgba(0,255,65,0.3)',
        }} />
      </Header>
      
      <AlertBanner alerts={alerts} />

      <div style={{ gridColumn: '1 / 2', overflowY: 'auto' }}>
        <JupiterPanel 
          rpcUrl={rpcUrl} 
          walletContextState={walletContextState} 
          onTradeSuccess={handleTradeSuccess} 
          network={network} 
        />
      </div>

      <div style={{ gridColumn: '2 / 3', overflowY: 'auto', borderLeft: 'var(--border)', borderRight: 'var(--border)' }}>
        <SpikeDashboard 
          priceHistory={priceHistory}
          solPrice={solPrice}
          scores={scores} 
          autoTradeEnabled={autoTradeEnabled} 
          onToggleAutoTrade={handleToggleAutoTrade} 
          threshold={70} 
        />
      </div>

      <div style={{ gridColumn: '3 / 4', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TradeHistory trades={trades} network={network} />
        <PnLChart trades={trades} />
      </div>
    </div>
  )
}

export default function App() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <AppContent />
      </WalletProvider>
    </ConnectionProvider>
  )
}
