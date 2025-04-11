# Usage Guide for the Advanced AI Trading Bot

## 1. Installation

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

## 2. Configuration

The bot can be configured through multiple interfaces:
- **Web Dashboard**: Access settings through the dashboard interface.
- **Extension Popup**: Quick settings in the Chrome extension.
- **Configuration Files**:
  - `backend/config.js`: Main server configuration.
  - `extension/manifest.json`: Extension configuration.

### Key Configuration Parameters
- **Bot Mode**: Simulation or Live Trading.
- **Trading Parameters**: Maximum investment, stop loss, take profit, etc.
- **Risk Management**: Maximum risk per trade, maximum open positions, etc.
- **Screen Analysis Settings**: Confidence threshold, pattern matching threshold.

## 3. Usage

### Web Interface
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
2. Access the web interface at `http://localhost:8000`.
   - Register/Login to your account.
   - Navigate to Dashboard for monitoring.
   - Configure settings as needed.

### Chrome Extension
1. Click the extension icon in Chrome.
2. Login with your credentials.
3. Click "Activate Bot" to start monitoring the current page.
4. Use the dashboard for detailed monitoring and configuration.

## 4. Security Features
- JWT-based authentication.
- Password encryption.
- Protected API endpoints.
- Secure configuration management.

## 5. Conclusion
This guide provides a comprehensive overview of how to install, configure, and use the Advanced AI Trading Bot. For further assistance, refer to the documentation or community forums.
