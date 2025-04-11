// API endpoint
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const authForm = document.getElementById('authForm');
const botControls = document.getElementById('botControls');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const toggleBot = document.getElementById('toggleBot');
const openDashboard = document.getElementById('openDashboard');
const statusIcon = document.getElementById('statusIcon');
const botStatus = document.getElementById('botStatus');
const dailyTrades = document.getElementById('dailyTrades');
const profitLoss = document.getElementById('profitLoss');

// Check authentication status on popup open
chrome.storage.local.get(['token'], function(result) {
    if (result.token) {
        showBotControls();
        updateBotStatus();
    } else {
        showAuthForm();
    }
});

// Login handler
loginBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        const data = await response.json();
        if (response.ok) {
            chrome.storage.local.set({ token: data.token }, function() {
                showBotControls();
                updateBotStatus();
            });
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    }
});

// Register handler
registerBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        });

        const data = await response.json();
        if (response.ok) {
            showSuccess('Registration successful. Please login.');
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['token'], function() {
        showAuthForm();
    });
});

// Toggle bot handler
toggleBot.addEventListener('click', async () => {
    try {
        const token = await getToken();
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const response = await fetch(`${API_URL}/bot/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: tab.url,
                active: toggleBot.textContent === 'Activate Bot'
            })
        });

        if (response.ok) {
            updateBotStatus();
        } else {
            showError('Failed to toggle bot');
        }
    } catch (error) {
        showError('Failed to toggle bot');
    }
});

// Open dashboard handler
openDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:8000/dashboard.html' });
});

// Update bot status
async function updateBotStatus() {
    try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/bot/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            updateStatusUI(data);
        }
    } catch (error) {
        console.error('Failed to update status:', error);
    }
}

// Helper functions
function showAuthForm() {
    authForm.classList.remove('hidden');
    botControls.classList.add('hidden');
}

function showBotControls() {
    authForm.classList.add('hidden');
    botControls.classList.remove('hidden');
}

function updateStatusUI(data) {
    const isActive = data.isActive;
    statusIcon.className = isActive ? 'fas fa-power-off text-success' : 'fas fa-power-off text-gray-400';
    botStatus.textContent = isActive ? 'Active' : 'Inactive';
    botStatus.className = isActive ? 'text-lg font-semibold text-success' : 'text-lg font-semibold text-gray-500';
    toggleBot.textContent = isActive ? 'Deactivate Bot' : 'Activate Bot';
    
    // Update statistics
    dailyTrades.textContent = data.stats?.daily?.trades || 0;
    const profit = data.stats?.daily?.profit || 0;
    const loss = data.stats?.daily?.loss || 0;
    profitLoss.textContent = `$${(profit - loss).toFixed(2)}`;
    profitLoss.className = profit - loss >= 0 ? 'text-lg font-semibold text-success' : 'text-lg font-semibold text-danger';
}

function showError(message) {
    // Implement error notification
    console.error(message);
}

function showSuccess(message) {
    // Implement success notification
    console.log(message);
}

async function getToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['token'], function(result) {
            if (result.token) {
                resolve(result.token);
            } else {
                reject(new Error('No token found'));
            }
        });
    });
}

// Update status every 5 seconds when bot is active
setInterval(updateBotStatus, 5000);
