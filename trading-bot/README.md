# Advanced AI Trading Bot

An intelligent trading bot that uses advanced screen analysis and machine learning to execute trades automatically. This bot is designed to provide better performance than traditional trading bots through its sophisticated analysis capabilities.

## Features

- 🤖 Advanced screen analysis using AI
- 📊 Real-time trading signals
- 🛡️ Built-in risk management
- 📈 Performance monitoring
- ⚙️ Configurable trading parameters
- 🔄 Automated trade execution
- 🔒 Secure authentication
- 🌐 Chrome extension support

## System Requirements

- Node.js >= 14.0.0
- Modern web browser (Chrome recommended for extension)
- Internet connection

## Installation

### Backend Server

1. Clone the repository:
```bash
git clone <repository-url>
cd trading-bot
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Start the backend server:
```bash
npm start
```

### Chrome Extension

1. Install extension dependencies:
```bash
cd extension
npm install
```

2. Generate extension icons:
```bash
npm run generate-icons
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `trading-bot/extension` directory

## Configuration

The bot can be configured through multiple interfaces:

- Web Dashboard: Access settings through the dashboard interface
- Extension Popup: Quick settings in the Chrome extension
- Configuration Files:
  - `backend/config.js`: Main server configuration
  - `extension/manifest.json`: Extension configuration

### Key Configuration Parameters

- Bot Mode: Simulation or Live Trading
- Trading Parameters:
  - Maximum investment per trade
  - Stop loss percentage
  - Take profit percentage
  - Maximum daily trades
- Risk Management:
  - Maximum risk per trade
  - Maximum open positions
  - Maximum drawdown
- Screen Analysis Settings:
  - Confidence threshold
  - Pattern matching threshold

## Usage

### Web Interface

1. Start the backend server:
```bash
cd backend
npm start
```

2. Access the web interface at `http://localhost:8000`
   - Register/Login to your account
   - Navigate to Dashboard for monitoring
   - Configure settings as needed

### Chrome Extension

1. Click the extension icon in Chrome
2. Login with your credentials
3. Click "Activate Bot" to start monitoring the current page
4. Use the dashboard for detailed monitoring and configuration

## Security Features

- JWT-based authentication
- Password encryption
- Protected API endpoints
- Secure configuration management
- Session management

## Architecture

### Backend Components

- `bot.js`: Main bot engine and API endpoints
- `screenAnalyzer.js`: Screen analysis and pattern detection
- `tradeExecutor.js`: Trade execution and position management
- `logger.js`: Logging system
- `config.js`: Configuration management

### Extension Components

- `popup.html/js`: Extension UI and control
- `background.js`: Extension background process
- `content.js`: Page analysis and monitoring
- `manifest.json`: Extension configuration

### Frontend Components

- `index.html`: Landing page
- `dashboard.html`: Trading dashboard
- `settings.html`: Configuration interface

## Error Handling

The bot includes comprehensive error handling:

- Network error recovery
- Invalid trade protection
- Configuration validation
- Logging of all errors and warnings

## Logging

Detailed logging system that captures:

- Trade executions
- Screen analysis results
- Error conditions
- System status changes
- Authentication events

## Security Considerations

- Input validation on all API endpoints
- Secure configuration management
- Protection against invalid trades
- Risk management enforcement
- Authentication required for all operations

## Development

To run in development mode with auto-reload:

```bash
# Backend server
cd backend
npm run dev

# Extension
cd extension
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Disclaimer

This bot is provided as-is without any guarantees. Trading involves risk, and you should never trade with money you cannot afford to lose. The bot's performance can vary based on market conditions and configuration.
