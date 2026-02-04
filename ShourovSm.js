'use strict';

const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const login = require('shourov-fca');
const log = require('./utils/log');

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= WEB SERVER ================= */

app.get('/', (req, res) => {
  res.send('SHOUROV BOT RUNNING');
});

app.listen(PORT, '0.0.0.0', () => {
  log.success(`Web server running on port ${PORT}`);
});

/* ================= PATHS ================= */

const FBSTATE_PATH = path.join(__dirname, 'Shourovstate.json');
const FCA_CONFIG_PATH = path.join(__dirname, 'ShourovFca.json');

/* ================= APPSTATE PARSER ================= */

function detectAndParseAppState(raw) {
  raw = raw.trim();
  if (!raw) return null;

  // JSON array
  if (raw.startsWith('[')) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Netscape
  if (raw.includes('\t')) {
    const cookies = [];
    raw.split('\n').forEach(line => {
      if (!line || line.startsWith('#')) return;
      const p = line.split('\t');
      if (p.length >= 7) {
        cookies.push({
          key: p[5],
          value: p[6],
          domain: p[0],
          path: p[2],
          hostOnly: false,
          creation: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        });
      }
    });
    return cookies.length ? cookies : null;
  }

  // Cookie string
  if (raw.includes('=') && raw.includes(';')) {
    return raw.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return {
        key: k,
        value: v.join('='),
        domain: 'facebook.com',
        path: '/',
        hostOnly: false,
        creation: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };
    });
  }

  return null;
}

/* ================= LOAD COOKIE ================= */

if (!fs.existsSync(FBSTATE_PATH)) {
  log.err('Shourovstate.json not found. Cookie login required.');
  process.exit(1);
}

const rawState = fs.readFileSync(FBSTATE_PATH, 'utf8');
const appState = detectAndParseAppState(rawState);

if (!Array.isArray(appState) || !appState.find(c => c.key === 'c_user')) {
  log.err('Invalid cookie in Shourovstate.json');
  process.exit(1);
}

log.success('Cookie loaded from Shourovstate.json');

/* ================= FCA CONFIG ================= */

let fcaOptions = {};
if (fs.existsSync(FCA_CONFIG_PATH)) {
  try {
    fcaOptions = JSON.parse(fs.readFileSync(FCA_CONFIG_PATH, 'utf8')).optionsFca || {};
  } catch {
    log.warn('Invalid ShourovFca.json, using default options');
  }
}

/* ================= LOGIN ================= */

login(
  {
    appState,
    forceLogin: true,
    listenEvents: true,
    selfListen: false,
    logLevel: 'silent'
  },
  (err, api) => {

    if (err) {
      // ⛔ checkpoint ignore
      if (
        err.code === 'CHECKPOINT_REQUIRED' ||
        String(err).toLowerCase().includes('checkpoint')
      ) {
        log.warn('Checkpoint detected, continuing with cookie session...');
      } else {
        log.err('LOGIN ERROR');
        console.error(err);
        return;
      }
    }

    log.success('BOT LOGIN SUCCESS');

    if (api?.setOptions) {
      api.setOptions(fcaOptions);
    }

    // Save refreshed cookie (optional but safe)
    try {
      fs.writeFileSync(
        FBSTATE_PATH,
        JSON.stringify(api.getAppState(), null, 2)
      );
      log.success('Cookie refreshed & saved');
    } catch {}

    /* ================= START BOT ================= */

    require('./Shourov.js')(api);
  }
);
