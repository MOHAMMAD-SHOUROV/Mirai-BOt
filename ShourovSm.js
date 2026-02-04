'use strict';

const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const { login } = require('shourov-fca');
const log = require('./utils/log');

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './shourov.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    log.success(`Web server running on port ${PORT}`);
});

const FBSTATE_PATH = path.join(__dirname, 'Shourovstate.json');
const FCA_CONFIG_PATH = path.join(__dirname, 'ShourovFca.json');

function detectAndParseAppState(raw) {
    raw = raw.trim();
    if (!raw) return null;
    
    // Check if it's a JSON array (standard appState)
    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            log.err('Failed to parse JSON array appState');
        }
    }
    
    // Check if it's Netscape format (starts with # Netscape HTTP Cookie File)
    if (raw.includes('Netscape HTTP Cookie File') || raw.split('\n').some(line => line.includes('\t'))) {
        try {
            const lines = raw.split('\n');
            const jsonCookies = [];
            lines.forEach(line => {
                if (!line.trim() || line.startsWith('#')) return;
                const parts = line.split('\t');
                if (parts.length >= 7) {
                    jsonCookies.push({
                        key: parts[5],
                        value: parts[6].trim(),
                        domain: parts[0],
                        path: parts[2],
                        hostOnly: parts[3] === 'FALSE',
                        creation: new Date().toISOString(),
                        lastAccessed: new Date().toISOString()
                    });
                }
            });
            return jsonCookies.length > 0 ? jsonCookies : null;
        } catch (e) {
            log.err('Failed to parse Netscape appState');
        }
    }
    
    // Try raw cookie string (key1=val1; key2=val2)
    if (raw.includes('=') && raw.includes(';')) {
        try {
            return raw.split(';').map(pair => {
                const [key, ...val] = pair.trim().split('=');
                return {
                    key: key,
                    value: val.join('='),
                    domain: 'facebook.com',
                    path: '/',
                    hostOnly: false,
                    creation: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                };
            });
        } catch (e) {
            log.err('Failed to parse cookie string appState');
        }
    }
    
    return null;
}

let appState = null;
if (fs.existsSync(FBSTATE_PATH)) {
    const rawState = fs.readFileSync(FBSTATE_PATH, 'utf8');
    appState = detectAndParseAppState(rawState);
    if (!appState) {
        log.err('Shourovstate.json found but format is unrecognized or invalid.');
    }
} else {
    log.warn('Shourovstate.json not found. Please provide it for cookie-based login.');
}

let fcaConfig = { optionsFca: {} };
if (fs.existsSync(FCA_CONFIG_PATH)) {
    try {
        fcaConfig = JSON.parse(fs.readFileSync(FCA_CONFIG_PATH, 'utf8'));
    } catch (e) {
        log.err('Failed to parse ShourovFca.json');
    }
}

const loginData = { appState };

login(loginData, (err, api) => {
    if (err) {
        if (err.code === 'CHECKPOINT_REQUIRED') {
            log.err('LOGIN FAILED: Account requires checkpoint verification. Please login in a browser first.');
        } else {
            log.err('BOT LOGIN FAILED');
            console.error(err);
        }
        return;
    }

    log.success('BOT LOGIN SUCCESS');

    if (api && api.setOptions && fcaConfig.optionsFca) {
        api.setOptions(fcaConfig.optionsFca);
    }

    // Start existing bot logic
    require('./Shourov.js');
});
