const fetch = require('node-fetch');
const db = require('./db');

async function getQuote({ inputMint, outputMint, amount, slippageBps = 50 }) {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Jupiter Quote API error: ${response.statusText}`);
  }
  return await response.json();
}

async function buildSwapTransaction({ quoteResponse, userPublicKey }) {
  const url = 'https://quote-api.jup.ag/v6/swap';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
    })
  });
  
  if (!response.ok) {
    throw new Error(`Jupiter Swap API error: ${response.statusText}`);
  }
  
  const { swapTransaction } = await response.json();
  return swapTransaction;
}

async function recordTrade(tradeData) {
  const id = db.insertTrade(tradeData);
  return id;
}

async function updateTrade(id, status, txHash, pnlUsd) {
  db.updateTradeStatus(id, status, txHash, pnlUsd);
}

module.exports = {
  getQuote,
  buildSwapTransaction,
  recordTrade,
  updateTrade
};
