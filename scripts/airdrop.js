const { execSync } = require('child_process');

console.log('Requesting airdrop of 2 SOL on devnet...');
try {
  const result = execSync('solana airdrop 2 --url devnet', { encoding: 'utf-8' });
  console.log('Airdrop successful:');
  console.log(result);
} catch (error) {
  console.error('Airdrop failed. Error:', error.message);
  if (error.stdout) console.log(error.stdout);
  if (error.stderr) console.error(error.stderr);
}

console.log('\nIf the command failed, you might be rate-limited or missing the solana CLI.');
console.log('You can also get devnet SOL by visiting the official faucet:');
console.log('https://faucet.solana.com');
console.log('Make sure your Phantom wallet is set to Devnet!');
