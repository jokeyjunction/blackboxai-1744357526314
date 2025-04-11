// Advanced logging system for the trading bot

const fs = require('fs');
const path = require('path');
const config = require('./config');

class Logger {
    constructor() {
        this.logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        this.setupLogDirectory();
    }

    setupLogDirectory() {
        if (config.logging.enableFileLogging) {
            const logDir = config.logging.logDirectory;
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
        }
        
        return logMessage;
    }

    writeToFile(message) {
        if (config.logging.enableFileLogging) {
            const date = new Date().toISOString().split('T')[0];
            const logFile = path.join(config.logging.logDirectory, `${date}.log`);
            
            fs.appendFileSync(logFile, message + '\n');
        }
    }

    shouldLog(level) {
        const configLevel = config.logging.level.toLowerCase();
        return this.logLevels[level] >= this.logLevels[configLevel];
    }

    debug(message, data = null) {
        if (this.shouldLog('debug')) {
            const logMessage = this.formatMessage('debug', message, data);
            console.debug(logMessage);
            this.writeToFile(logMessage);
        }
    }

    info(message, data = null) {
        if (this.shouldLog('info')) {
            const logMessage = this.formatMessage('info', message, data);
            console.info(logMessage);
            this.writeToFile(logMessage);
        }
    }

    warn(message, data = null) {
        if (this.shouldLog('warn')) {
            const logMessage = this.formatMessage('warn', message, data);
            console.warn(logMessage);
            this.writeToFile(logMessage);
        }
    }

    error(message, error = null) {
        if (this.shouldLog('error')) {
            const logMessage = this.formatMessage('error', message, {
                error: error ? {
                    message: error.message,
                    stack: error.stack
                } : null
            });
            console.error(logMessage);
            this.writeToFile(logMessage);
        }
    }

    // Trading specific logging methods
    logTrade(tradeData) {
        this.info('Trade executed', tradeData);
    }

    logAnalysis(analysisData) {
        this.debug('Screen analysis completed', analysisData);
    }

    logAlert(alertMessage, alertData = null) {
        this.warn(alertMessage, alertData);
    }
}

module.exports = new Logger();
