// Configuration settings for the trading bot

const config = {
    // Bot settings
    bot: {
        name: 'Advanced Trading Bot',
        version: '1.0.0',
        mode: 'live', // 'simulation' or 'live'
        updateInterval: 5000, // Screen analysis interval in milliseconds
    },

    // Trading parameters
    trading: {
        maxInvestmentPerTrade: 1000,
        stopLossPercentage: 2,
        takeProfitPercentage: 4,
        maxDailyTrades: 10,
        maxDailyLoss: 5000,
    },

    // Risk management
    riskManagement: {
        maxRiskPerTrade: 2, // percentage
        maxOpenPositions: 3,
        maxDrawdown: 10, // percentage
    },

    // Screen analysis settings
    screenAnalysis: {
        confidenceThreshold: 0.85,
        patternMatchingThreshold: 0.90,
        minimumSignalStrength: 0.75,
    },

    // Logging settings
    logging: {
        level: 'info', // 'debug', 'info', 'warn', 'error'
        enableFileLogging: true,
        logDirectory: './logs',
    },

    // Server settings
    server: {
        port: 3000,
        host: 'localhost',
    }
};

module.exports = config;
