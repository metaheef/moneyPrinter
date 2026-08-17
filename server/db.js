require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'money-printer.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    input_mint TEXT,
    output_mint TEXT,
    input_symbol TEXT,
    output_symbol TEXT,
    input_amount REAL,
    output_amount REAL,
    input_usd REAL,
    output_usd REAL,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending',
    pnl_usd REAL,
    network TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS price_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint TEXT,
    symbol TEXT,
    timestamp TEXT,
    price_usd REAL,
    volume_change_pct REAL,
    price_change_pct REAL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint TEXT,
    symbol TEXT,
    score INTEGER,
    signals TEXT,
    timestamp TEXT,
    auto_traded INTEGER DEFAULT 0
  );
`);

function insertTrade(trade) {
  const stmt = db.prepare(`
    INSERT INTO trades (timestamp, input_mint, output_mint, input_symbol, output_symbol, input_amount, output_amount, input_usd, output_usd, tx_hash, status, network)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    new Date().toISOString(),
    trade.inputMint,
    trade.outputMint,
    trade.inputSymbol,
    trade.outputSymbol,
    trade.inputAmount,
    trade.outputAmount,
    trade.inputUsd,
    trade.outputUsd,
    trade.txHash || null,
    trade.status || 'pending',
    process.env.SOLANA_NETWORK || 'devnet'
  );
  return info.lastInsertRowid;
}

function updateTradeStatus(id, status, txHash, pnlUsd) {
  const stmt = db.prepare(`
    UPDATE trades SET status = ?, tx_hash = ?, pnl_usd = ? WHERE id = ?
  `);
  stmt.run(status, txHash || null, pnlUsd || null, id);
}

function getTrades(limit = 50) {
  const stmt = db.prepare(`SELECT * FROM trades ORDER BY id DESC LIMIT ?`);
  return stmt.all(limit);
}

function insertPriceSnapshot(snap) {
  const stmt = db.prepare(`
    INSERT INTO price_snapshots (mint, symbol, timestamp, price_usd, volume_change_pct, price_change_pct)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(snap.mint, snap.symbol, new Date().toISOString(), snap.price_usd, snap.volume_change_pct || 0, snap.price_change_pct || 0);
}

function getPriceSnapshots(mint, limit = 100) {
  const stmt = db.prepare(`SELECT * FROM price_snapshots WHERE mint = ? ORDER BY id DESC LIMIT ?`);
  return stmt.all(mint, limit).reverse(); // Return in chronological order
}

function insertAlert(alert) {
  const stmt = db.prepare(`
    INSERT INTO alerts (mint, symbol, score, signals, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(alert.mint, alert.symbol, alert.score, JSON.stringify(alert.signals), new Date().toISOString());
  return info.lastInsertRowid;
}

function getAlerts(limit = 20) {
  const stmt = db.prepare(`SELECT * FROM alerts ORDER BY id DESC LIMIT ?`);
  return stmt.all(limit).map(a => ({ ...a, signals: JSON.parse(a.signals) }));
}

module.exports = {
  insertTrade,
  updateTradeStatus,
  getTrades,
  insertPriceSnapshot,
  getPriceSnapshots,
  insertAlert,
  getAlerts
};
