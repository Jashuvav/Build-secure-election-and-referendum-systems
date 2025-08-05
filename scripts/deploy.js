const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

async function main() {
  try {
    console.log('Compiling Move contract...');
    execSync('aptos move compile', { stdio: 'inherit' });

    console.log('Publishing contract...');
    execSync('aptos move publish', { stdio: 'inherit' });

    console.log('Contract published successfully!');
    
    // Get the deployed address
    const profilePath = path.join(process.env.HOME, '.aptos', 'config.yaml');
    const profile = fs.readFileSync(profilePath, 'utf8');
    const address = profile.match(/account: ([a-f0-9x]+)/)[1];
    
    // Update the contract address in the frontend
    updateContractAddress(address);

    console.log('Contract address updated in frontend files');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function updateContractAddress(address) {
  const files = [
    '../frontend/components/PollCreate.tsx',
    '../frontend/components/PollDetails.tsx',
    '../frontend/components/NFTClaim.tsx',
    '../frontend/components/FeedbackForm.tsx'
  ];

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/0x<contract_address>/g, address);
    fs.writeFileSync(file, content);
  });
}

main();
