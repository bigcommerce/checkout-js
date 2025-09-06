# Development Server Enhancement

This directory contains enhanced development server scripts that improve the BigCommerce Checkout JS development workflow using [listhen](https://github.com/unjs/listhen).

## Scripts

### dev-server.js
Main development server script that combines webpack development build with HTTP server and optional tunneling via listhen.

**Features:**
- Unified command to start both webpack dev build and HTTP server
- Optional HTTPS tunneling via listhen (powered by untun)
- Automatic port selection and process management
- Configurable via CLI arguments or environment variables
- Verbose logging mode for debugging
- Built-in static file serving with CORS support

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
- `DEV_SERVER_PORT`: HTTP server port (default: 8080, auto-selected with listhen)
- `DEV_SERVER_VERBOSE`: Enable verbose logging ('true'/'false')  
- `DEV_SERVER_BUILD_DIR`: Build directory to serve (default: build)

## Architecture

The dev-server.js script manages:

1. **Webpack Process**: Runs `npm run dev` for watch mode compilation
2. **Listhen Server**: Elegant HTTP server with optional tunneling capabilities
   - Static file serving for the build directory
   - Automatic CORS headers
   - SPA routing support (fallback to index.html)
   - Optional HTTPS tunnel via untun/cloudflared

All processes are managed with proper signal handling and cleanup on exit.

## Benefits of Listhen Integration

- **Automatic port selection**: No more port conflicts during development
- **Built-in tunneling**: Simplified tunnel setup without manual cloudflared installation
- **Better error handling**: Graceful fallbacks when tunneling is unavailable
- **Modern architecture**: Based on unjs ecosystem with h3 and nitro foundation