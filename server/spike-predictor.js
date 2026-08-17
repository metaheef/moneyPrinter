require('dotenv').config();
const EventEmitter = require('events');
const { RSI, MACD, BollingerBands, ROC } = require('technicalindicators');
const { getPriceHistory } = require('./data-aggregator');
const db = require('./db');

const predictorEvents = new EventEmitter();
const THRESHOLD = parseInt(process.env.SPIKE_SCORE_THRESHOLD || '70', 10);
const latestScores = {};

function analyzeToken(mint) {
  const history = getPriceHistory(mint);
  if (history.length < 30) return; // Need sufficient data
  
  const prices = history.map(h => h.price_usd);
  let score = 0;
  const signals = [];
  
  // 1. RSI(14)
  const rsiInput = { values: prices, period: 14 };
  const rsiVals = RSI.calculate(rsiInput);
  if (rsiVals.length > 0) {
    const currentRsi = rsiVals[rsiVals.length - 1];
    if (currentRsi < 35) {
      score += 30;
      signals.push(`Strong Bullish RSI: ${currentRsi.toFixed(2)}`);
    } else if (currentRsi < 50 && rsiVals.length > 1 && rsiVals[rsiVals.length - 2] < currentRsi) {
      score += 15;
      signals.push(`Weak Bullish RSI (Rising): ${currentRsi.toFixed(2)}`);
    }
  }

  // 2. MACD(12,26,9)
  const macdInput = { values: prices, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false };
  const macdVals = MACD.calculate(macdInput);
  if (macdVals.length > 1) {
    const current = macdVals[macdVals.length - 1];
    const prev = macdVals[macdVals.length - 2];
    if (prev.MACD < prev.signal && current.MACD > current.signal) {
      score += 25;
      signals.push('MACD Bullish Crossover');
    }
  }

  // 3. Bollinger Bands(20,2)
  const bbInput = { values: prices, period: 20, stdDev: 2 };
  const bbVals = BollingerBands.calculate(bbInput);
  if (bbVals.length > 0) {
    const currentBb = bbVals[bbVals.length - 1];
    const currentPrice = prices[prices.length - 1];
    const bandwidth = (currentBb.upper - currentBb.lower) / currentBb.middle;
    if (bandwidth < 0.05) {
      score += 10;
      signals.push('Bollinger Squeeze (Volatility warning)');
    }
    if (currentPrice > currentBb.upper) {
      score += 20;
      signals.push('Price broke above upper BB');
    }
  }

  // 4. Volume/Price change
  const currentPriceChange = history[history.length - 1].price_change_pct;
  const last10 = history.slice(-10);
  const avgPriceChange = last10.reduce((acc, val) => acc + Math.abs(val.price_change_pct), 0) / last10.length;
  if (currentPriceChange > 0 && currentPriceChange > 1.5 * avgPriceChange && avgPriceChange > 0) {
    score += 20;
    signals.push('High relative price change');
  }

  // 5. Price Rate of Change(10)
  const rocInput = { values: prices, period: 10 };
  const rocVals = ROC.calculate(rocInput);
  if (rocVals.length > 0) {
    const currentRoc = rocVals[rocVals.length - 1];
    if (currentRoc > 2) {
      score += 20;
      signals.push(`High ROC: ${currentRoc.toFixed(2)}%`);
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);
  
  const symbol = history[history.length - 1].symbol;
  const price = prices[prices.length - 1];
  
  latestScores[mint] = { score, signals, timestamp: new Date().toISOString() };

  if (score >= THRESHOLD) {
    const alert = { mint, symbol, score, signals, price };
    db.insertAlert(alert);
    predictorEvents.emit('spike_alert', alert);
  }
}

function startPredictor() {
  setInterval(() => {
    const trackedTokens = (process.env.TRACKED_TOKENS || '').split(',').filter(Boolean);
    for (const mint of trackedTokens) {
      analyzeToken(mint);
    }
  }, 60000); // 60s
}

function getLatestScores() {
  return latestScores;
}

module.exports = {
  startPredictor,
  getLatestScores,
  predictorEvents
};
