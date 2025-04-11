const logger = require('./logger');
const config = require('./config');

class TradeExecutor {
    constructor() {
        this.openPositions = new Map();
        this.dailyStats = {
            trades: 0,
            profit: 0,
            loss: 0
        };
        this.resetDailyStats();
    }

    resetDailyStats() {
        const now = new Date();
        this.lastResetDate = now.toDateString();
        this.dailyStats = {
            trades: 0,
            profit: 0,
            loss: 0
        };
        logger.info('Daily stats reset');
    }

    checkDailyReset() {
        const now = new Date();
        if (now.toDateString() !== this.lastResetDate) {
            this.resetDailyStats();
        }
    }

    async executeTrade(signal, price, amount) {
        try {
            this.checkDailyReset();

            // Check if we can make more trades today
            if (this.dailyStats.trades >= config.trading.maxDailyTrades) {
                logger.warn('Maximum daily trades reached');
                return null;
            }

            // Check if we've hit maximum daily loss
            if (this.dailyStats.loss >= config.trading.maxDailyLoss) {
                logger.warn('Maximum daily loss reached');
                return null;
            }

            // Check if we have too many open positions
            if (this.openPositions.size >= config.riskManagement.maxOpenPositions) {
                logger.warn('Maximum open positions reached');
                return null;
            }

            // Calculate position size based on risk management
            const positionSize = this.calculatePositionSize(price, amount);
            if (!positionSize) {
                return null;
            }

            // Execute the trade based on the signal
            const tradeResult = await this.placeOrder(signal, price, positionSize);
            
            if (tradeResult.success) {
                // Update statistics and track position
                this.dailyStats.trades++;
                if (signal.buy) {
                    this.openPositions.set(tradeResult.orderId, {
                        type: 'buy',
                        price: price,
                        size: positionSize,
                        stopLoss: this.calculateStopLoss(price, 'buy'),
                        takeProfit: this.calculateTakeProfit(price, 'buy')
                    });
                }

                logger.logTrade({
                    type: signal.buy ? 'buy' : 'sell',
                    price: price,
                    size: positionSize,
                    orderId: tradeResult.orderId
                });

                return tradeResult;
            }

            return null;
        } catch (error) {
            logger.error('Error executing trade', error);
            return null;
        }
    }

    calculatePositionSize(price, suggestedAmount) {
        const maxInvestment = config.trading.maxInvestmentPerTrade;
        const riskPerTrade = config.riskManagement.maxRiskPerTrade / 100;
        
        // Calculate position size based on risk management rules
        const positionSize = Math.min(
            suggestedAmount,
            maxInvestment / price
        );

        // Ensure position size doesn't exceed risk limits
        const potentialLoss = positionSize * price * riskPerTrade;
        if (potentialLoss > config.trading.maxDailyLoss - this.dailyStats.loss) {
            logger.warn('Position size exceeds risk limits');
            return null;
        }

        return positionSize;
    }

    calculateStopLoss(entryPrice, orderType) {
        const stopLossPercentage = config.trading.stopLossPercentage / 100;
        return orderType === 'buy' 
            ? entryPrice * (1 - stopLossPercentage)
            : entryPrice * (1 + stopLossPercentage);
    }

    calculateTakeProfit(entryPrice, orderType) {
        const takeProfitPercentage = config.trading.takeProfitPercentage / 100;
        return orderType === 'buy'
            ? entryPrice * (1 + takeProfitPercentage)
            : entryPrice * (1 - takeProfitPercentage);
    }

    async placeOrder(signal, price, size) {
        try {
            // In simulation mode, just return a simulated order
            if (config.bot.mode === 'simulation') {
                return this.simulateOrder(signal, price, size);
            }

            // Implement actual trading API calls here
            // This is where you would integrate with a real trading platform
            throw new Error('Live trading not implemented');

        } catch (error) {
            logger.error('Error placing order', error);
            return null;
        }
    }

    simulateOrder(signal, price, size) {
        const orderId = `sim_${Date.now()}`;
        return {
            success: true,
            orderId: orderId,
            type: signal.buy ? 'buy' : 'sell',
            price: price,
            size: size,
            timestamp: new Date().toISOString()
        };
    }

    async checkOpenPositions(currentPrice) {
        for (const [orderId, position] of this.openPositions) {
            // Check stop loss
            if (position.type === 'buy' && currentPrice <= position.stopLoss) {
                await this.closePosition(orderId, currentPrice, 'stop_loss');
            }
            // Check take profit
            else if (position.type === 'buy' && currentPrice >= position.takeProfit) {
                await this.closePosition(orderId, currentPrice, 'take_profit');
            }
        }
    }

    async closePosition(orderId, currentPrice, reason) {
        try {
            const position = this.openPositions.get(orderId);
            if (!position) return;

            const pnl = (currentPrice - position.price) * position.size;
            
            if (pnl > 0) {
                this.dailyStats.profit += pnl;
            } else {
                this.dailyStats.loss += Math.abs(pnl);
            }

            this.openPositions.delete(orderId);

            logger.info('Position closed', {
                orderId,
                reason,
                pnl,
                closePrice: currentPrice
            });

        } catch (error) {
            logger.error('Error closing position', error);
        }
    }

    getStats() {
        return {
            daily: this.dailyStats,
            openPositions: Array.from(this.openPositions.entries())
        };
    }
}

module.exports = new TradeExecutor();
