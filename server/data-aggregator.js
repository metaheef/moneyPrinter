require('dotenv').config();
const EventEmitter = require('events');
const fetch = require('node-fetch');
const db = require('./db');

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const POLL_INTERVAL = process.env.PRICE_POLL_INTERVAL_MS || 30000;

const dataEvents = new EventEmitter();

const priceHistory = {
  [SOL_MINT]: [],
  [USDC_MINT]: []
};

function getSymbol(mint) {
  if (mint === SOL_MINT) return 'SOL';
  if (mint === USDC_MINT) return 'USDC';
  return 'UNKNOWN';
}

async function seedHistoricalData() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1&interval=hourly');
    if (res.ok) {
      const data = await res.json();
      const prices = data.prices || [];
      const history = prices.map(p => ({
        mint: SOL_MINT,
        symbol: 'SOL',
        timestamp: new Date(p[0]).toISOString(),
        price_usd: p[1],
        volume_change_pct: 0,
        price_change_pct: 0
      }));
      
      // Keep last 200
      const recent = history.slice(-200);
      priceHistory[SOL_MINT] = recent;
      
      // Save to db
      for (const snap of recent) {
        db.insertPriceSnapshot(snap);
      }
      console.log('Seeded historical SOL data');
    }
  } catch (err) {
    console.error('Error seeding historical data:', err.message);
  }
}

async function fetchCurrentPrices() {
  const trackedTokens = (process.env.TRACKED_TOKENS || '').split(',').filter(Boolean);
  
  for (const mint of trackedTokens) {
    if (mint === USDC_MINT) continue; // Skip USDC since it's the quote token
    
    try {
      // Jupiter Price API v2 - returns USD price directly
      const url = `https://api.jup.ag/price/v2?ids=${mint}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.data && data.data[mint]) {
        const price = parseFloat(data.data[mint].price);
        const history = priceHistory[mint] || [];
        
        let priceChangePct = 0;
        if (history.length > 0) {
          const lastPrice = history[history.length - 1].price_usd;
          priceChangePct = ((price - lastPrice) / lastPrice) * 100;
        }

        const snap = {
          mint,
          symbol: getSymbol(mint),
          timestamp: new Date().toISOString(),
          price_usd: price,
          volume_change_pct: 0, // jupiter price api doesn't give volume, mock for now
          price_change_pct: priceChangePct
        };

        if (!priceHistory[mint]) priceHistory[mint] = [];
        priceHistory[mint].push(snap);
        if (priceHistory[mint].length > 200) {
          priceHistory[mint].shift();
        }

        db.insertPriceSnapshot(snap);
        dataEvents.emit('price_update', snap);
      }
    } catch (err) {
      console.error(`Error fetching price for ${mint}:`, err.message);
    }
  }
}

function startAggregator() {
  seedHistoricalData().then(() => {
    fetchCurrentPrices();
    setInterval(fetchCurrentPrices, POLL_INTERVAL);
  });
}

function getPriceHistory(mint) {
  return priceHistory[mint] || [];
}

function getCurrentPrice(mint) {
  if (mint === USDC_MINT) return 1.0;
  const history = priceHistory[mint];
  if (history && history.length > 0) {
    return history[history.length - 1].price_usd;
  }
  return 0;
}

module.exports = {
  startAggregator,
  getPriceHistory,
  getCurrentPrice,
  dataEvents
};
