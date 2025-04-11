// Content script for Trading Bot Extension

// Initialize analysis data structure
let analysisData = {
    price: null,
    volume: null,
    indicators: {},
    patterns: {}
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ANALYZE_PAGE') {
        analyzePage();
    }
    return true;
});

// Main analysis function
async function analyzePage() {
    try {
        // Extract price data
        extractPriceData();
        
        // Analyze technical indicators
        analyzeIndicators();
        
        // Detect patterns
        detectPatterns();
        
        // Send analysis results to background script
        chrome.runtime.sendMessage({
            type: 'ANALYSIS_RESULT',
            data: analysisData
        });
    } catch (error) {
        console.error('Error analyzing page:', error);
    }
}

// Extract price information from the page
function extractPriceData() {
    try {
        // Example selectors - adjust based on target websites
        const priceElement = document.querySelector('[data-price]') || 
                           document.querySelector('.price') ||
                           document.querySelector('#price');
                           
        const volumeElement = document.querySelector('[data-volume]') ||
                            document.querySelector('.volume') ||
                            document.querySelector('#volume');

        if (priceElement) {
            analysisData.price = parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ''));
        }

        if (volumeElement) {
            analysisData.volume = parseFloat(volumeElement.textContent.replace(/[^0-9.-]+/g, ''));
        }
    } catch (error) {
        console.error('Error extracting price data:', error);
    }
}

// Analyze technical indicators
function analyzeIndicators() {
    try {
        // Example indicators - adjust based on requirements
        analysisData.indicators = {
            rsi: extractIndicator('RSI'),
            macd: extractIndicator('MACD'),
            movingAverage: calculateMovingAverage()
        };
    } catch (error) {
        console.error('Error analyzing indicators:', error);
    }
}

// Helper function to extract indicator values
function extractIndicator(indicatorName) {
    const element = document.querySelector(`[data-indicator="${indicatorName}"]`) ||
                   document.querySelector(`.${indicatorName.toLowerCase()}`) ||
                   document.querySelector(`#${indicatorName.toLowerCase()}`);
    
    return element ? parseFloat(element.textContent.replace(/[^0-9.-]+/g, '')) : null;
}

// Calculate moving average (example implementation)
function calculateMovingAverage() {
    try {
        const priceHistory = document.querySelectorAll('[data-price-history] .price');
        if (priceHistory.length > 0) {
            const prices = Array.from(priceHistory).map(el => 
                parseFloat(el.textContent.replace(/[^0-9.-]+/g, ''))
            ).filter(price => !isNaN(price));

            if (prices.length > 0) {
                return prices.reduce((sum, price) => sum + price, 0) / prices.length;
            }
        }
        return null;
    } catch (error) {
        console.error('Error calculating moving average:', error);
        return null;
    }
}

// Detect trading patterns
function detectPatterns() {
    try {
        analysisData.patterns = {
            bullish: detectBullishPatterns(),
            bearish: detectBearishPatterns()
        };
    } catch (error) {
        console.error('Error detecting patterns:', error);
    }
}

// Detect bullish patterns (example implementation)
function detectBullishPatterns() {
    const patterns = [];
    
    // Example pattern detection logic
    if (analysisData.price && analysisData.indicators.rsi) {
        // Oversold condition (RSI < 30)
        if (analysisData.indicators.rsi < 30) {
            patterns.push('oversold');
        }
        
        // Golden cross (if available)
        if (analysisData.indicators.movingAverage) {
            if (analysisData.price > analysisData.indicators.movingAverage) {
                patterns.push('golden_cross');
            }
        }
    }
    
    return patterns;
}

// Detect bearish patterns (example implementation)
function detectBearishPatterns() {
    const patterns = [];
    
    // Example pattern detection logic
    if (analysisData.price && analysisData.indicators.rsi) {
        // Overbought condition (RSI > 70)
        if (analysisData.indicators.rsi > 70) {
            patterns.push('overbought');
        }
        
        // Death cross (if available)
        if (analysisData.indicators.movingAverage) {
            if (analysisData.price < analysisData.indicators.movingAverage) {
                patterns.push('death_cross');
            }
        }
    }
    
    return patterns;
}

// Initialize analysis when script is loaded
analyzePage();
