// Background script for the Trading Bot Extension

let botActive = false;
const API_URL = 'http://localhost:3000/api';

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'BOT_TOGGLE':
            handleBotToggle(message.data);
            break;
        case 'GET_STATUS':
            sendResponse({ botActive });
            break;
    }
    return true;
});

// Handle bot activation/deactivation
async function handleBotToggle(data) {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/bot/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: data.url,
                active: data.active
            })
        });

        if (response.ok) {
            botActive = data.active;
            updateExtensionIcon();
            
            // Start or stop monitoring based on bot status
            if (botActive) {
                startMonitoring();
            } else {
                stopMonitoring();
            }
        }
    } catch (error) {
        console.error('Error toggling bot:', error);
    }
}

// Monitor active tab when bot is active
let monitoringInterval;

function startMonitoring() {
    if (!monitoringInterval) {
        monitoringInterval = setInterval(async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab) {
                    // Send message to content script to analyze page
                    chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' });
                }
            } catch (error) {
                console.error('Error during monitoring:', error);
            }
        }, 5000); // Monitor every 5 seconds
    }
}

function stopMonitoring() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
}

// Update extension icon based on bot status
function updateExtensionIcon() {
    const iconPath = botActive ? 'icons/icon48-active.png' : 'icons/icon48.png';
    chrome.action.setIcon({ path: iconPath });
}

// Helper function to get auth token
function getToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['token'], function(result) {
            resolve(result.token);
        });
    });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (botActive && changeInfo.status === 'complete') {
        // Reinject content script if needed
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
    }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (botActive) {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        // Send message to content script to analyze new active tab
        chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_PAGE' });
    }
});
