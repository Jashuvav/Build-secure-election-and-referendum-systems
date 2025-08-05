project name:
Build secure election and referendum systems

description:

A decentralized, secure voting and referendum system built on the Aptos blockchain. This application allows users to create polls, participate in voting, and view real-time results with full transparency and immutability.

🚀 Features
Core Functionality
Create Polls: Users can create polls with custom titles, descriptions, and multiple voting options

Secure Voting: One wallet, one vote system with blockchain verification

Real-time Results: Live voting results with percentage calculations and progress bars

Time-based Polls: Set start and end times for polls with automatic status updates

Poll Management: Poll creators can close polls and extend voting periods

User Feedback: Participants can submit feedback after voting

Security Features
Blockchain Immutability: All votes are permanently recorded on the Aptos blockchain

One Vote Per Wallet: Prevents duplicate voting through smart contract validation

Time Validation: Smart contract enforces voting time windows

Owner Verification: Only poll creators can manage their polls

Event Logging: All actions are logged as blockchain events for transparency

User Experience
Modern UI: Clean, responsive interface built with React and Tailwind CSS

Wallet Integration: Seamless integration with Petra wallet

Real-time Updates: Live status updates and vote counting

Mobile Responsive: Works perfectly on desktop and mobile devices

Toast Notifications: User-friendly feedback for all actions

🛠️ Technology Stack
Backend (Smart Contract)
Move Language: Aptos smart contract for voting logic

Aptos Framework: Standard library for blockchain operations

Event System: Comprehensive event logging for transparency

Frontend
React 18: Modern React with hooks and functional components

TypeScript: Type-safe development

Tailwind CSS: Utility-first CSS framework

Radix UI: Accessible UI components

Lucide React: Beautiful icons

Aptos SDK: Official Aptos TypeScript SDK

Wallet Integration
Petra Wallet: Primary wallet support

Aptos Wallet Adapter: Standardized wallet integration

📋 Prerequisites
Before running this application, make sure you have:

Node.js (v16 or higher)

npm or yarn

Petra Wallet browser extension installed

Aptos CLI (for contract deployment)

🚀 Quick Start
1. Clone the Repository
bash
git clone <repository-url>
cd votingsystem
2. Install Dependencies
bash
npm install
3. Environment Setup
Create a .env file in the root directory:

text
VITE_APP_NETWORK=testnet
VITE_MODULE_ADDRESS=your_deployed_contract_address
VITE_APTOS_API_KEY=your_aptos_api_key
4. Deploy Smart Contract
bash
# Compile the contract
npm run move:compile

# Deploy to testnet
npm run move:publish
5. Update Contract Address
After deployment, update the VITE_MODULE_ADDRESS in your .env file with the deployed contract address.

6. Start Development Server
bash
npm run dev
The application will be available at http://localhost:5173

📖 Usage Guide
Creating a Poll
Connect your Petra wallet

Navigate to the "Create Poll" tab

Fill in the poll details:

Title (required)

Description (required)

Add voting options (minimum 2, maximum 10)

Set start and end times

Click "Create Poll"

Confirm the transaction in your wallet

Voting in a Poll
Browse available polls in the "View Polls" tab

Click on a poll to view details

Select your preferred option

Click "Cast Vote"

Confirm the transaction in your wallet

Viewing Results
Real-time results are displayed in the poll details

Results show vote counts and percentages

Progress bars visualize voting distribution

Your vote is highlighted with a checkmark

🔧 Smart Contract Functions
Core Functions
create_poll: Create a new voting poll

vote: Cast a vote in an active poll

close_poll: Close a poll (creator only)

extend_poll: Extend voting period (creator only)

View Functions
get_poll_title: Get poll title

get_poll_options: Get poll options

get_results: Get voting results

is_poll_closed: Check if a poll is closed

Events
PollCreatedEvent: Emitted when a poll is created

VoteCastEvent: Emitted when a vote is cast

PollClosedEvent: Emitted when a poll is closed

🏗️ Project Structure
text
votingsystem/
├── contract/                 # Move smart contract
│   ├── sources/
│   │   └── voting.move       # Main voting contract
│   ├── tests/
│   │   └── test_end_to_end.move
│   └── Move.toml
├── frontend/                 # React frontend
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── PollCreate.tsx   # Poll creation form
│   │   ├── PollList.tsx     # Poll listing
│   │   └── PollDetails.tsx  # Poll details and voting
│   ├── utils/               # Utility functions
│   │   ├── votingService.ts # Smart contract integration
│   │   └── aptosClient.ts   # Aptos client setup
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Main application component
├── scripts/                 # Deployment scripts
└── package.json
🔒 Security Considerations
Smart Contract Security
Input validation for all parameters

Time-based access control

One vote per wallet enforcement

Owner-only functions for poll management

Comprehensive error handling

Frontend Security
Wallet signature verification

Transaction confirmation requirements

Input sanitization and validation

Secure API key management

🧪 Testing
Smart Contract Tests
bash
npm run move:test
Frontend Tests
bash
npm run test
🚀 Deployment
Smart Contract Deployment
bash
# Deploy to testnet
npm run move:publish

# Deploy to mainnet
npm run move:publish -- --network mainnet
Frontend Deployment
bash
# Build for production
npm run build

# Deploy to Vercel
npm run deploy
🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📄 License
This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

🆘 Support
If you encounter any issues or have questions:

Check the Issues page

Create a new issue with detailed information

Join our community discussions

🔮 Future Enhancements
NFT voting certificates

Multi-signature poll creation

Advanced voting mechanisms (ranked choice, quadratic voting)

Poll templates and categories

Analytics dashboard

Mobile app

Integration with other Aptos DeFi protocols

📸 Screenshot

![Transaction Success]

0x25064895e3b30d85f34aa33490843140cd79f99c82b058a34cbc51bebdbb2448

(screenshots/Screenshot 2025-08-05 182510.png)confirming the funding transaction on Aptos testnet.)*

Built with ❤️ on Aptos Blockchain

