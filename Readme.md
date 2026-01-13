# Polymarket Copy Trading Bot

> Automated trading bot for Polymarket with copy trading and frontrunning capabilities

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](LICENSE)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env  # Edit with your settings

# Run in development
npm run dev

# Or build and run in production
npm run build && npm start
```

## ⚙️ Configuration

Create a `.env` file with these required settings:

```env
# Required
TARGET_ADDRESSES=0xabc...,0xdef...    # Trader addresses to follow
PUBLIC_KEY=your_wallet_address         # Your Polygon wallet
PRIVATE_KEY=your_private_key           # Your wallet private key
RPC_URL=https://polygon-rpc-endpoint   # Polygon RPC URL

# Optional
MONGO_URI=mongodb://localhost:27017/polymarket-bot
HEALTH_CHECK_PORT=3000
MIN_TRADE_SIZE_USD=100
FRONTRUN_SIZE_MULTIPLIER=0.5
GAS_PRICE_MULTIPLIER=1.2
MAX_SLIPPAGE_PERCENT=2.0
```

## 📋 Features

- **Copy Trading** - Automatically mirror trades from successful traders
- **Frontrunning** - Execute trades before target transactions with priority gas
- **Mempool Monitoring** - Real-time detection of pending transactions
- **Risk Management** - Position tracking, slippage protection, exposure limits
- **Performance Optimized** - Parallel processing, connection pooling, smart caching
- **Production Ready** - Health monitoring, MongoDB persistence, graceful shutdown

## 🏗️ Architecture

```
src/
├── app/              # Application entry point
├── cli/              # CLI commands
├── config/           # Configuration management
├── core/             # Core constants, types, errors
├── domain/           # Domain models and types
├── infrastructure/   # External services (MongoDB, CLOB client)
├── services/         # Business logic services
└── utils/            # Utility functions
```

## 📖 How It Works

### Copy Trading Flow
1. Monitor target addresses via Polymarket API
2. Detect new trades in real-time
3. Validate trade (size, limits, balance)
4. Execute proportional trade
5. Track position

### Frontrunning Flow
1. Monitor Polygon mempool for pending transactions
2. Poll Polymarket API for recent trades
3. Extract trade details and gas price from pending transaction
4. Calculate frontrun gas: `target_gas × multiplier`
5. Execute with priority gas price
6. Track position

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run in development mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled code |
| `npm run lint` | Run linter |
| `npm run check-allowance` | Check USDC allowance |
| `npm run set-token-allowance` | Set token allowance |
| `npm run manual-sell` | Manually sell positions |

## 🔍 Health Monitoring

The bot exposes HTTP endpoints for monitoring:

```bash
# Health check
curl http://localhost:3000/health

# Detailed metrics
curl http://localhost:3000/metrics
```

Metrics include:
- Uptime
- Trades executed/failed
- Wallet balances (POL/USDC)
- Error history
- Health status

## 🐳 Docker

```bash
# Build
docker build -t polymarket-bot .

# Run
docker run --env-file .env -d --name polymarket-bot polymarket-bot

# View logs
docker logs -f polymarket-bot
```

## ⚠️ Requirements

- **Node.js 18+**
- **Polygon Wallet** with USDC balance
- **POL/MATIC** for gas fees (recommended: 0.5+ POL)
- **MongoDB** (optional, for persistence)
- **RPC Endpoint** that supports pending transaction monitoring

## 🔧 Performance Optimizations

- **Parallel Processing** - Multiple addresses monitored concurrently
- **Connection Pooling** - Optimized HTTP connections (50 max sockets)
- **Smart Caching** - Order book caching with automatic cleanup
- **Batch Operations** - Database batch writes for efficiency
- **Rate Limiting** - Burst-aware rate limiting with reservoirs

## 🐛 Troubleshooting

**Bot not detecting trades:**
- Verify `TARGET_ADDRESSES` are correct
- Check RPC URL supports pending transactions
- Ensure `MIN_TRADE_SIZE_USD` threshold isn't too high

**Orders failing:**
- Check USDC balance
- Verify POL balance for gas (>0.2 POL recommended)
- Confirm market is still active

**High gas costs:**
- Lower `GAS_PRICE_MULTIPLIER` (e.g., 1.1 instead of 1.2)
- Increase `MIN_TRADE_SIZE_USD` to only frontrun larger trades

## 🔐 Security

- Never commit `.env` file
- Use environment variables for secrets
- Rotate private keys regularly
- Monitor balances for unusual activity
- Use minimum required wallet permissions

## 📊 Recent Trades

- [Example Trade #1](https://polygonscan.com/tx/0xa06942c7972bc4bafc0e4631b92efd948a1a23daefd687382a6a292368beab8b) - $0.1 on Market X
- [Example Trade #2](https://polygonscan.com/tx/0x93c0968a7ac34ff8f09d687465990f0d59e59c416c5e1914b0fbe88370c3ba3c) - $0.06 on Market Y

## ⚖️ Disclaimer

This software is provided "as-is" for educational purposes only. Trading cryptocurrencies involves substantial risk. Use at your own risk. The authors are not responsible for any financial losses.

## 📄 License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📞 Support

- **E-Mail**: admin@hyperbuildx.com
- **Telegram**: [@0xAlche](https://t.me/bettyjk_0915)

---

**Keywords**: Polymarket bot, copy trading bot, frontrun bot, automated trading, Polygon bot, prediction markets
