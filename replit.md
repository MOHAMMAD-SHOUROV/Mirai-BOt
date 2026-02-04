# Shourov-Bot

## Overview

Shourov-Bot is a Facebook Messenger chatbot built using the `shourov-fca` (Facebook Chat API) library. It's designed to run as a Node.js application that connects to Facebook Messenger and responds to commands and events in group chats and direct messages. The bot features a modular command system, auto-reply functionality, image generation/manipulation, media downloading, and various entertainment features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture

**Entry Points:**
- `ShourovSm.js` - Main entry point that starts an Express web server on port 5000 and handles Facebook login
- `Shourov.js` - Alternative entry point with more extensive initialization and global state setup

**Authentication:**
- Uses Facebook app state (cookies) stored in `Shourovstate.json` for authentication
- Configuration options in `ShourovFca.json` control FCA behavior (event listening, presence updates, etc.)

**Command System:**
- Commands are stored in `Script/commands/` directory as individual JavaScript modules
- Each command exports a `config` object (name, version, permissions, cooldowns) and a `run` function
- Some commands also export `handleEvent` for no-prefix event-based triggers
- Permission levels: 0 (everyone), 2 (admin/moderator), 3 (bot owner only)

**Event Handling:**
- `includes/listen.js` handles incoming Facebook events
- Controllers for Users, Threads, and Currencies manage data persistence
- Scheduled tasks run via `node-cron` for periodic operations

**Global State:**
- `global.client` stores commands, events, cooldowns, and reply handlers
- `global.data` manages thread info, user data, and ban lists
- `global.config` loaded from `config.json` contains bot settings

### Data Storage

- SQLite database (`data.sqlite`) for persistent storage via Sequelize
- JSON files for configuration and state management
- Cache directory (`Script/commands/cache/`) for temporary files (images, videos)

### Key Features

- **AI Integration:** Commands for Gemini AI, DALL-E image generation, and chat AI
- **Media Processing:** Image manipulation using Jimp and Canvas libraries
- **Social Features:** Love/relationship image generators, profile cards, group management
- **Auto-Reply System:** Configurable trigger-response patterns in `Autoreply.js`
- **Admin Controls:** User/thread banning, notification broadcasting, group management

## External Dependencies

### Core Libraries
- `shourov-fca` - Facebook Chat API wrapper for Messenger bot functionality
- `express` - Web server for health checks and status page
- `sequelize` - ORM for SQLite database operations

### Media & Image Processing
- `canvas` - Server-side canvas for image generation
- `jimp` - Image manipulation (resize, composite, effects)
- `axios` - HTTP client for API calls and file downloads

### Facebook Integration
- Uses Facebook Graph API for user avatars and profile data
- Requires valid Facebook session cookies for authentication

### External APIs
- Various image generation APIs (Pollinations AI, custom APIs)
- YouTube/video download APIs
- AI services (Gemini, DALL-E via third-party endpoints)

### Configuration Files
- `config.json` - Bot settings, admin IDs, prefix, database config
- `ShourovFca.json` - FCA library options
- `Shourovstate.json` - Facebook authentication cookies (sensitive)

### Environment
- Node.js 20.x required
- Runs on port 5000 (web server) or 8080 (GitHub Actions)