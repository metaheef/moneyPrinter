require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const db = require('./db');
const { startAggregator, dataEvents, getCurrentPrice } = require('./data-aggregator');
const { startPredictor, getLatestScores, predictorEvents } = require('./spike-predictor');
const { getQuote, buildSwapTransaction, recordTrade, updateTrade } = require('./trade-engine');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Start background services
startAggregator();
startPredictor();

wss.on('connection', (ws) => {
  // Send welcome message
  const trackedTokens = (process.env.TRACKED_TOKENS || '').split(',').filter(Boolean);
  const currentPrices = {};
  trackedTokens.forEach(mint => {
    currentPrices[mint] = getCurrentPrice(mint);
  });
  
  ws.send(JSON.stringify({
    type: 'welcome',
    data: {
      prices: currentPrices,
      alerts: db.getAlerts(5)
    }
  }));
});

// Broadcast events
dataEvents.on('price_update', (data) => {
  const msg = JSON.stringify({ type: 'price_update', data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
});

predictorEvents.on('spike_alert', (data) => {
  const msg = JSON.stringify({ type: 'spike_alert', data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
});

// REST API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', network: process.env.SOLANA_NETWORK, timestamp: new Date().toISOString() });
});

app.get('/api/prices', (req, res) => {
  const trackedTokens = (process.env.TRACKED_TOKENS || '').split(',').filter(Boolean);
  const prices = {};
  trackedTokens.forEach(mint => {
    prices[mint] = getCurrentPrice(mint);
  });
  res.json(prices);
});

app.get('/api/trades', (req, res) => {
  res.json(db.getTrades(50));
});

app.post('/api/trades', async (req, res) => {
  try {
    const id = await recordTrade(req.body);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/trades/:id', async (req, res) => {
  try {
    const { status, txHash, pnlUsd } = req.body;
    await updateTrade(req.params.id, status, txHash, pnlUsd);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quote', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps } = req.query;
    const quote = await getQuote({ inputMint, outputMint, amount, slippageBps });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/swap-transaction', async (req, res) => {
  try {
    const { quoteResponse, userPublicKey } = req.body;
    const swapTransaction = await buildSwapTransaction({ quoteResponse, userPublicKey });
    res.json({ swapTransaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/scores', (req, res) => {
  res.json(getLatestScores());
});

app.get('/api/alerts', (req, res) => {
  res.json(db.getAlerts(20));
});

app.get('/api/auto-trade', (req, res) => {
  res.json({ enabled: process.env.AUTO_TRADE_ENABLED === 'true' });
});

app.post('/api/auto-trade', (req, res) => {
  const { enabled } = req.body;
  process.env.AUTO_TRADE_ENABLED = String(enabled);
  res.json({ enabled });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  $$   MONEY PRINTER ONLINE     $$
  $$   PORT: ${PORT}               $$
  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  `);
});
