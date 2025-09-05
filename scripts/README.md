# Development Server Enhancement

This directory contains enhanced development server scripts that improve the BigCommerce Checkout JS development workflow.

## Scripts

### dev-server.js
Main development server script that combines webpack development build with HTTP server and optional Cloudflare Tunnels integration.

**Features:**
- Unified command to start both webpack dev build and HTTP server
- Optional HTTPS tunneling via Cloudflare Tunnels
- Automatic process management and cleanup
- Configurable via CLI arguments or environment variables
- Verbose logging mode for debugging

### install-cloudflared.js
Automatically downloads and installs the cloudflared binary required for tunnel functionality.

**Features:**
- Automatic download from GitHub releases
- Cross-platform support (currently Linux)
- Proper executable permissions setup
- Graceful failure handling

### test-dev-server.js
Test script to verify the development server functionality.

**Features:**
- Automated testing of dev server startup
- HTTP endpoint validation
- Proper cleanup and error handling

## Usage Examples

```bash
# Basic development server
npm run dev:full

# Development server with HTTPS tunnel
npm run dev:tunnel

# Custom port and verbose logging
DEV_SERVER_PORT=3000 DEV_SERVER_VERBOSE=true npm run dev:full

# Using the script directly
node scripts/dev-server.js --help
node scripts/dev-server.js --port 9000 --tunnel --verbose
```

## Environment Variables

- `DEV_SERVER_TUNNEL`: Enable tunnel mode ('true'/'false')
- `DEV_SERVER_PORT`: HTTP server port (default: 8080)
- `DEV_SERVER_VERBOSE`: Enable verbose logging ('true'/'false')  
- `CLOUDFLARED_PATH`: Custom path to cloudflared binary

## Architecture

The dev-server.js script manages multiple processes:

1. **Webpack Process**: Runs `npm run dev` for watch mode compilation
2. **HTTP Server Process**: Runs `http-server` on the build directory
3. **Cloudflared Process** (optional): Creates HTTPS tunnel

All processes are managed with proper signal handling and cleanup on exit.