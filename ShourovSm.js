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

let appState = null;
if (fs.existsSync(FBSTATE_PATH)) {
    try {
        const rawState = fs.readFileSync(FBSTATE_PATH, 'utf8');
        if (rawState.trim()) {
            appState = JSON.parse(rawState);
        }
    } catch (e) {
        log.err('Failed to parse Shourovstate.json');
    }
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
        log.err('BOT LOGIN FAILED');
        console.error(err);
        return;
    }

    log.success('BOT LOGIN SUCCESS');

    if (api && api.setOptions && fcaConfig.optionsFca) {
        api.setOptions(fcaConfig.optionsFca);
    }

    // Start existing bot logic
    require('./Shourov.js');
});
