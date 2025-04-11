const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const screenAnalyzer = require('./screenAnalyzer');
const tradeExecutor = require('./tradeExecutor');
const logger = require('./logger');
const config = require('./config');

// In-memory user store (replace with database in production)
const users = new Map();
const JWT_SECRET = 'your-secret-key'; // Change this in production

// Authentication middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

class TradingBot {
    constructor() {
        this.isActive = false;
        this.targetUrl = '';
        this.analysisInterval = null;
        this.setupServer();
        this.setupAuthRoutes();
    }

    setupAuthRoutes() {
        // Register new user
        this.app.post('/api/auth/register', async (req, res) => {
            try {
                const { username, password } = req.body;
                
                if (users.has(username)) {
                    return res.status(400).json({ error: 'Username already exists' });
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                users.set(username, {
                    username,
                    password: hashedPassword
                });

                res.json({ message: 'User registered successfully' });
            } catch (error) {
                logger.error('Error in registration', error);
                res.status(500).json({ error: 'Registration failed' });
            }
        });

        // Login user
        this.app.post('/api/auth/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                const user = users.get(username);

                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ token });
            } catch (error) {
                logger.error('Error in login', error);
                res.status(500).json({ error: 'Login failed' });
            }
        });
    }

    setupServer() {
        this.app = express();
        this.app.use(cors({
            origin: 'http://localhost:8000',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express.json());

        // Protected API routes
        this.app.use('/api/bot', authenticate);
        this.setupRoutes();

        // Start server
        this.app.listen(config.server.port, () => {
            logger.info(`Trading bot server started on port ${config.server.port}`);
        });
    }

    setupRoutes() {
        // Activate/deactivate bot
        this.app.post('/api/bot/toggle', async (req, res) => {
            try {
                const { url, active } = req.body;
                
                if (active) {
                    await this.activate(url);
                    res.json({ status: 'activated', targetUrl: this.targetUrl });
                } else {
                    await this.deactivate();
                    res.json({ status: 'deactivated' });
                }
            } catch (error) {
                logger.error('Error toggling bot', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Get bot status
        this.app.get('/api/bot/status', (req, res) => {
            const status = {
                isActive: this.isActive,
                targetUrl: this.targetUrl,
                mode: config.bot.mode,
                stats: tradeExecutor.getStats()
            };
            res.json(status);
        });

        // Update configuration
        this.app.post('/api/bot/config', (req, res) => {
            try {
                const newConfig = req.body;
                this.updateConfig(newConfig);
                res.json({ status: 'success', config: config });
            } catch (error) {
                logger.error('Error updating config', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Get trading history
        this.app.get('/api/bot/history', (req, res) => {
            const stats = tradeExecutor.getStats();
            res.json(stats);
        });
    }

    async activate(url) {
        if (this.isActive) {
            throw new Error('Bot is already active');
        }

        this.targetUrl = url;
        this.isActive = true;

        // Initialize screen analyzer
        await screenAnalyzer.initialize();

        // Start analysis loop
        this.startAnalysis();
        
        logger.info('Bot activated', { targetUrl: url });
    }

    async deactivate() {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;
        this.targetUrl = '';

        // Clear analysis interval
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        // Close browser
        await screenAnalyzer.close();
        
        logger.info('Bot deactivated');
    }

    startAnalysis() {
        this.analysisInterval = setInterval(async () => {
            if (!this.isActive) return;

            try {
                // Analyze screen
                const analysis = await screenAnalyzer.analyzeScreen(this.targetUrl);

                // Check if we have valid signals
                if (analysis.signals && analysis.confidence >= config.screenAnalysis.confidenceThreshold) {
                    // Execute trade based on signals
                    const tradeResult = await tradeExecutor.executeTrade(
                        analysis.signals,
                        analysis.priceData.currentPrice,
                        1000 // Example amount, should be calculated based on strategy
                    );

                    if (tradeResult) {
                        logger.info('Trade executed successfully', tradeResult);
                    }
                }

                // Check and update open positions
                await tradeExecutor.checkOpenPositions(analysis.priceData.currentPrice);

            } catch (error) {
                logger.error('Error in analysis loop', error);
            }
        }, config.bot.updateInterval);
    }

    updateConfig(newConfig) {
        // Validate new configuration
        this.validateConfig(newConfig);

        // Update configuration
        Object.assign(config, newConfig);
        
        logger.info('Configuration updated');
    }

    validateConfig(newConfig) {
        // Add validation logic here
        if (newConfig.trading) {
            if (newConfig.trading.maxInvestmentPerTrade <= 0) {
                throw new Error('Invalid maxInvestmentPerTrade value');
            }
            if (newConfig.trading.stopLossPercentage <= 0) {
                throw new Error('Invalid stopLossPercentage value');
            }
        }

        if (newConfig.riskManagement) {
            if (newConfig.riskManagement.maxRiskPerTrade <= 0) {
                throw new Error('Invalid maxRiskPerTrade value');
            }
        }
    }
}

// Create and export bot instance
const bot = new TradingBot();
module.exports = bot;
