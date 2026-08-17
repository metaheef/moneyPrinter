import React, { useEffect } from 'react';

export default function JupiterPanel({ rpcUrl, walletContextState, onTradeSuccess, network }) {
  useEffect(() => {
    if (window.Jupiter) {
      window.Jupiter.init({
        displayMode: 'integrated',
        integratedTargetId: 'jupiter-terminal-container',
        endpoint: rpcUrl,
        defaultExplorer: 'Solscan',
        formProps: {
          initialInputMint: 'So11111111111111111111111111111111111111112',
          initialOutputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        },
        passthroughWalletContextState: walletContextState,
        onSuccess: ({ txid, swapResult }) => {
          if (onTradeSuccess) {
            onTradeSuccess({ txid, swapResult });
          }
        }
      });
    }
  }, [rpcUrl, walletContextState, onTradeSuccess]);

  return (
    <div style={{ height: '100%', padding: '20px', overflowY: 'auto' }}>
      <div 
        id="jupiter-terminal-container" 
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius)', overflow: 'hidden' }}
      >
        {!window.Jupiter && (
          <div style={{ padding: '20px', color: 'var(--text-dim)' }}>
            Loading Jupiter Terminal...
          </div>
        )}
      </div>
    </div>
  );
}
