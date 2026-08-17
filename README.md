# 🖨️ Money Printer — Solana Trading Terminal

> A locally-hosted trading terminal powered by Jupiter Aggregator. Track trades, predict market spikes, and auto-trade SOL/USDC with Phantom wallet.

![Money Printer Terminal](client/public/logo.png)

---

## Features

- **Jupiter Terminal** — embedded swap UI (SOL ↔ USDC default)
- **Phantom Wallet** — browser wallet passthrough, keys never leave your browser
- **Spike Predictor** — RSI, MACD, Bollinger Bands, Volume, ROC composite scoring (0–100)
- **Auto-Trade** — fires swaps automatically when spike score ≥ threshold
- **Trade History** — SQLite-backed trade log with Solscan links + P&L tracking
- **Live WebSocket** — real-time price updates pushed from backend
- **Black + Matrix Green** terminal aesthetic

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React |
| Wallet | Phantom via `@solana/wallet-adapter` |
| Trading View | Jupiter Terminal v2 embed |
| Backend | Node.js + Express + WebSockets |
| Database | SQLite (`better-sqlite3`) |
| Indicators | `technicalindicators` (RSI, MACD, BB, ROC) |
| Price Data | Jupiter Price API v2 + CoinGecko (free, no API key) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- [Phantom Wallet](https://phantom.app/) browser extension
- (Optional) [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) for devnet airdrops

### 1. Clone & Install

```bash
git clone https://github.com/metaheef/moneyPrinter.git
cd moneyPrinter

# Install root deps (concurrently)
npm install

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure Environment

Copy `.env.example` to `.env` and edit as needed:

```bash
cp .env.example .env
```

Key settings in `.env`:
```
SOLANA_NETWORK=devnet              # or mainnet-beta
SOLANA_RPC_URL=https://api.devnet.solana.com
SPIKE_SCORE_THRESHOLD=70           # auto-trade fires at this score
AUTO_TRADE_ENABLED=false           # toggle via UI
AUTO_TRADE_AMOUNT_SOL=0.05
```

### 3. Run

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

### 4. Get Devnet SOL

```bash
npm run airdrop
# or visit https://faucet.solana.com
```

---

## Windows Setup

Same steps as above. Make sure you have:
- [Node.js 18+ for Windows](https://nodejs.org/)
- Git for Windows (or WSL2)

If `better-sqlite3` fails to build on Windows, run:
```bash
npm install --global windows-build-tools
cd server && npm rebuild better-sqlite3
```

---

## Switching to Mainnet

Edit `.env`:
```
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Then restart: `npm run dev`

> ⚠️ **Real money warning**: Only enable auto-trade on mainnet with an amount you're comfortable losing. Set `AUTO_TRADE_AMOUNT_SOL` to a small value.

---

## Project Structure

```
moneyPrinter/
├── server/
│   ├── index.js          # Express + WebSocket server
│   ├── db.js             # SQLite (trades, snapshots, alerts)
│   ├── data-aggregator.js # Jupiter Price API + CoinGecko
│   ├── spike-predictor.js # RSI/MACD/BB/ROC scoring engine
│   └── trade-engine.js   # Jupiter quote + swap builder
├── client/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── JupiterPanel.jsx    # Jupiter Terminal embed
│       │   ├── SpikeDashboard.jsx  # Live score + signals
│       │   ├── TradeHistory.jsx    # Trade log table
│       │   ├── PnLChart.jsx        # Cumulative P&L (Recharts)
│       ├── hooks/useWebSocket.js
│       └── index.css               # Black + green terminal theme
├── scripts/
│   └── airdrop.js        # Devnet SOL airdrop helper
├── .env.example
└── package.json
```

---

## License

MIT — go print money 🖨️💵
