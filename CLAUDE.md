# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DecentraPredict is a decentralized prediction market platform built on Solana blockchain. The project consists of three main components:

- **Backend** (prediction-market-backend/): Node.js + Express API server with MongoDB
- **Frontend** (prediction-market-frontend/): Next.js React application
- **Smart Contracts** (prediction-market-smartcontract/): Anchor framework Rust contracts

## Development Commands

### Backend (prediction-market-backend/)
```bash
npm run dev      # Development server with hot reload
npm start        # Production server
npm run build    # Compile TypeScript
```

### Frontend (prediction-market-frontend/)
```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint check
```

### Smart Contracts (prediction-market-smartcontract/)
```bash
anchor build     # Build smart contracts
anchor test      # Run tests (includes Switchboard devnet setup)
anchor deploy    # Deploy to configured network
npm run lint     # Prettier formatting check
npm run lint:fix # Auto-fix formatting
```

## Architecture Overview

### Smart Contract Structure
The smart contracts implement the core prediction market logic:
- **Global state**: Manages platform fees and settings
- **Market creation**: Users create prediction markets with outcomes
- **Betting system**: Token-based betting on market outcomes
- **Liquidity**: Users can add SOL liquidity to markets
- **Oracle integration**: Switchboard oracles for real-world data
- **Resolution**: Automatic market resolution based on oracle results

Key contract addresses (devnet):
- Program ID: `Bki3CWk4AmVF78zvh81rup2EK2iJY4WRCUXesAv8TECF`

### Backend Architecture
- **Controllers**: Handle business logic for markets, oracles, profiles, referrals
- **Models**: MongoDB schemas for Market, Referral, Recent activity
- **SDK**: `prediction_market_sdk/` - Solana blockchain integration using Anchor
- **Oracle Service**: Switchboard integration for real-time data feeds

Key backend routes:
- `/api/market` - Market operations (create, bet, add liquidity)
- `/api/oracle` - Oracle data and resolution
- `/api/profile` - User profiles and activity
- `/api/referral` - Multi-level referral system

### Frontend Architecture
- **Pages**: Market listing, creation, funding, user profiles
- **Components**: Reusable UI elements and layouts
- **Context**: Global state management with wallet integration
- **Wallet Integration**: Phantom wallet adapter for Solana

## Environment Configuration

Backend requires these environment variables:
```
PORT =              # Server port
DB_URL =            # MongoDB Atlas connection
PASSKEY =           # Authentication key
FEE_AUTHORITY =     # Solana fee authority address
```

## Key Dependencies

### Solana/Blockchain
- `@coral-xyz/anchor` 0.29.0 - Smart contract framework
- `@solana/web3.js` 1.98.0 - Solana JavaScript SDK
- `@solana/spl-token` 0.4.13 - SPL token program

### Oracle Integration
- `@switchboard-xyz/common` 3.0.14 - Switchboard oracle integration
- `@switchboard-xyz/on-demand` 2.4.1 - On-demand oracle feeds

### Frontend
- Next.js 15.2.1 with React 19.0.0
- TailwindCSS 4.0.12 for styling
- Framer Motion for animations
- React wallet adapters for Solana integration

## Development Workflow

1. **Smart Contract Changes**:
   - Modify contracts in `prediction-market-smartcontract/src/`
   - Run `anchor build` to compile
   - Update IDL in frontend and backend if interface changes
   - Test with `anchor test`

2. **Backend Development**:
   - Start with `npm run dev` for hot reload
   - MongoDB required for data persistence
   - SDK handles all blockchain interactions

3. **Frontend Development**:
   - Run `npm run dev` for development server
   - Wallet connection required for blockchain operations
   - Backend API calls for off-chain data

## Testing

Smart contract tests include Switchboard devnet program clones for realistic oracle testing. Tests are located in `prediction-market-smartcontract/tests/` and run with Mocha/Chai.

## Deployment Notes

- Smart contracts deployed to Solana devnet (configurable in Anchor.toml)
- Backend can be deployed to any Node.js hosting service
- Frontend builds to static files suitable for Vercel/Netlify deployment
- MongoDB Atlas recommended for database hosting