# Quick Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Petra Wallet** browser extension
3. **Aptos CLI** (optional, for manual deployment)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Environment Setup

Create a `.env` file in the root directory:

```env
# Aptos Network Configuration
VITE_APP_NETWORK=testnet

# Contract Configuration
# This will be automatically updated after deployment
VITE_MODULE_ADDRESS=

# Aptos API Configuration
# Get your API key from: https://explorer.aptoslabs.com/account
VITE_APTOS_API_KEY=
```

## Step 3: Deploy Smart Contract

### Option A: Automatic Deployment (Recommended)
```bash
npm run deploy:contract
```

This script will:
- Compile the Move contract
- Run all tests
- Deploy to Aptos testnet
- Automatically update your `.env` file with the contract address

### Option B: Manual Deployment
```bash
# Compile contract
npm run move:compile

# Run tests
npm run move:test

# Deploy to testnet
npm run move:publish
```

After manual deployment, update the `VITE_MODULE_ADDRESS` in your `.env` file with the deployed contract address.

## Step 4: Get API Key

1. Go to [Aptos Explorer](https://explorer.aptoslabs.com/account)
2. Create an account or sign in
3. Generate an API key
4. Add the API key to `VITE_APTOS_API_KEY` in your `.env` file

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 6: Connect Wallet

1. Install [Petra Wallet](https://petra.app/) browser extension
2. Create a wallet or import existing one
3. Switch to Aptos testnet
4. Connect your wallet to the application

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Make sure you have testnet APT tokens
   - Check your Aptos CLI configuration
   - Ensure you're on the correct network

2. **Frontend can't connect to contract**
   - Verify `VITE_MODULE_ADDRESS` is set correctly
   - Check that the contract was deployed successfully
   - Ensure you're using the correct network

3. **Wallet connection issues**
   - Make sure Petra Wallet is installed
   - Check that you're on the correct network (testnet)
   - Try refreshing the page

4. **API errors**
   - Verify your API key is correct
   - Check that the API key has the necessary permissions
   - Ensure the network matches your configuration

### Getting Testnet APT

1. Go to [Aptos Faucet](https://aptoslabs.com/testnet-faucet)
2. Enter your wallet address
3. Request testnet APT tokens

### Manual Contract Address Update

If the automatic deployment doesn't update your `.env` file:

1. Find your deployed contract address in the deployment output
2. Update `VITE_MODULE_ADDRESS` in your `.env` file
3. Restart the development server

## Next Steps

Once everything is set up:

1. Create your first poll
2. Test voting functionality
3. Explore the results display
4. Try different poll configurations

## Support

If you encounter issues:

1. Check the [README.md](README.md) for detailed documentation
2. Review the troubleshooting section above
3. Check the console for error messages
4. Verify all environment variables are set correctly 