#!/usr/bin/env node

const { spawn } = require('child_process');
const { listen } = require('listhen');
const { createApp, eventHandler } = require('h3');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const access = promisify(fs.access);

class DevServer {
    constructor(options = {}) {
        this.options = {
            port: options.port || 8080,
            enableTunnel: options.enableTunnel || false,
            buildDir: options.buildDir || 'build',
            verbose: options.verbose || false,
            ...options
        };
        
        this.processes = [];
        this.serverInstance = null;
        this.tunnelUrl = null;
        this.serverReady = false;
        this.webpackReady = false;
    }

    log(message, force = false) {
        if (this.options.verbose || force) {
            console.log(`[DevServer] ${message}`);
        }
    }

    error(message) {
        console.error(`[DevServer ERROR] ${message}`);
    }

    async checkBuildDirectory() {
        try {
            await access(this.options.buildDir, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    startWebpack() {
        return new Promise((resolve, reject) => {
            this.log('Starting webpack in development mode...');
            
            const webpackProcess = spawn('npm', ['run', 'dev'], {
                stdio: ['inherit', 'pipe', 'pipe'],
                cwd: process.cwd()
            });

            this.processes.push(webpackProcess);

            let initialBuildComplete = false;

            webpackProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (this.options.verbose) {
                    process.stdout.write(`[Webpack] ${output}`);
                }

                // Look for webpack compilation completion indicators
                if (output.includes('webpack compiled') || output.includes('built at:')) {
                    if (!initialBuildComplete) {
                        this.log('Webpack initial build completed', true);
                        this.webpackReady = true;
                        initialBuildComplete = true;
                        resolve();
                    }
                }
            });

            webpackProcess.stderr.on('data', (data) => {
                const output = data.toString();
                if (this.options.verbose || output.includes('ERROR')) {
                    process.stderr.write(`[Webpack] ${output}`);
                }
            });

            webpackProcess.on('close', (code) => {
                if (code !== 0 && !initialBuildComplete) {
                    reject(new Error(`Webpack process exited with code ${code}`));
                }
            });

            // Fallback timeout in case we miss the completion message
            setTimeout(() => {
                if (!initialBuildComplete) {
                    this.log('Webpack build timeout reached, assuming ready', true);
                    this.webpackReady = true;
                    resolve();
                }
            }, 60000); // 60 second timeout
        });
    }

    createStaticFileHandler() {
        return eventHandler(async (event) => {
            let filePath = event.node.req.url;
            
            // Remove query parameters
            const urlParts = filePath.split('?');
            filePath = urlParts[0];
            
            // Handle root path
            if (filePath === '/') {
                filePath = '/index.html';
            }
            
            // Security: prevent directory traversal
            if (filePath.includes('..')) {
                event.node.res.statusCode = 400;
                return 'Bad Request';
            }
            
            const fullPath = path.join(this.options.buildDir, filePath);
            
            try {
                // Check if file exists
                await access(fullPath, fs.constants.F_OK);
                
                // Read file
                const content = fs.readFileSync(fullPath);
                
                // Set appropriate content type
                const ext = path.extname(fullPath).toLowerCase();
                const contentTypes = {
                    '.html': 'text/html',
                    '.js': 'application/javascript',
                    '.css': 'text/css',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.svg': 'image/svg+xml',
                    '.ico': 'image/x-icon',
                    '.woff': 'font/woff',
                    '.woff2': 'font/woff2',
                    '.ttf': 'font/ttf',
                    '.eot': 'application/vnd.ms-fontobject'
                };
                
                const contentType = contentTypes[ext] || 'application/octet-stream';
                event.node.res.setHeader('Content-Type', contentType);
                
                // Enable CORS
                event.node.res.setHeader('Access-Control-Allow-Origin', '*');
                event.node.res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                event.node.res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                
                return content;
                
            } catch (error) {
                // Try to find index.html for SPA routing
                if (filePath !== '/index.html') {
                    try {
                        const indexPath = path.join(this.options.buildDir, 'index.html');
                        await access(indexPath, fs.constants.F_OK);
                        const indexContent = fs.readFileSync(indexPath);
                        event.node.res.setHeader('Content-Type', 'text/html');
                        return indexContent;
                    } catch {
                        // Fall through to 404
                    }
                }
                
                event.node.res.statusCode = 404;
                return 'File not found';
            }
        });
    }

    async startListhenServer() {
        const buildDirExists = await this.checkBuildDirectory();
        if (!buildDirExists) {
            throw new Error(`Build directory '${this.options.buildDir}' does not exist. Run webpack first.`);
        }

        this.log('Creating HTTP server with listhen...', true);
        
        const app = createApp();
        app.use(this.createStaticFileHandler());

        const listenOptions = {
            port: this.options.port,
            showURL: this.options.verbose,
            clipboard: false,
            open: false,
            qr: false
        };

        // Enable tunnel if requested
        if (this.options.enableTunnel) {
            listenOptions.tunnel = true;
        }

        try {
            this.serverInstance = await listen(app, listenOptions);
            this.serverReady = true;
            
            // Extract URLs
            const localUrl = this.serverInstance.url;
            this.tunnelUrl = this.serverInstance.tunnel?.url;
            
            this.log(`HTTP server ready on ${localUrl}`, true);
            
            if (this.tunnelUrl) {
                this.log(`🌩️  Tunnel ready: ${this.tunnelUrl}`, true);
                this.log(`🔗 Auto-loader URL: ${this.tunnelUrl}/auto-loader-dev.js`, true);
            } else if (this.options.enableTunnel) {
                this.log('⚠️  Tunnel was requested but could not be established', true);
                this.log('💡 This is normal in offline environments or if tunnel service is unavailable', true);
            }
            
            return this.serverInstance;
            
        } catch (error) {
            if (this.options.enableTunnel && error.message.includes('tunnel')) {
                // Fallback: retry without tunnel
                this.log('⚠️  Tunnel failed, retrying without tunnel...', true);
                const fallbackOptions = { ...listenOptions, tunnel: false };
                
                this.serverInstance = await listen(app, fallbackOptions);
                this.serverReady = true;
                
                this.log(`HTTP server ready on ${this.serverInstance.url}`, true);
                this.log('💡 Tunnel is unavailable - continuing with local server only', true);
                
                return this.serverInstance;
            }
            
            throw error;
        }
    }

    async start() {
        try {
            this.log('🚀 Starting development server...', true);
            
            // Start webpack and wait for initial build
            await this.startWebpack();
            
            // Start listhen server
            await this.startListhenServer();

            this.log('✅ Development server is ready!', true);
            this.log(`📁 Build directory: ${this.options.buildDir}`, true);
            this.log(`🌐 Local server: ${this.serverInstance.url}`, true);
            if (this.tunnelUrl) {
                this.log(`🌩️  HTTPS tunnel: ${this.tunnelUrl}`, true);
                this.log(`🔧 For Custom Checkout, use: ${this.tunnelUrl}/auto-loader-dev.js`, true);
            }

        } catch (error) {
            this.error(`Failed to start development server: ${error.message}`);
            this.cleanup();
            process.exit(1);
        }
    }

    cleanup() {
        this.log('Cleaning up processes...', true);
        
        // Close listhen server
        if (this.serverInstance) {
            try {
                this.serverInstance.close();
            } catch (error) {
                this.log(`Error closing server: ${error.message}`);
            }
        }
        
        // Kill webpack process
        this.processes.forEach(proc => {
            if (proc && !proc.killed) {
                proc.kill('SIGTERM');
            }
        });
    }

    setupSignalHandlers() {
        process.on('SIGINT', () => {
            this.log('Received SIGINT, shutting down...', true);
            this.cleanup();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            this.log('Received SIGTERM, shutting down...', true);
            this.cleanup();
            process.exit(0);
        });
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--tunnel':
                options.enableTunnel = true;
                break;
            case '--port':
                options.port = parseInt(args[++i], 10);
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--build-dir':
                options.buildDir = args[++i];
                break;
            case '--help':
                console.log(`
Usage: node scripts/dev-server.js [options]

Options:
  --tunnel              Enable tunnel for HTTPS access (via listhen)
  --port <number>       Port for HTTP server (default: 8080)
  --verbose             Enable verbose logging
  --build-dir <path>    Build directory to serve (default: build)
  --help                Show this help message

Examples:
  node scripts/dev-server.js
  node scripts/dev-server.js --tunnel
  node scripts/dev-server.js --port 3000 --tunnel --verbose
                `);
                process.exit(0);
                break;
        }
    }

    // Check environment variables
    if (process.env.DEV_SERVER_TUNNEL === 'true') {
        options.enableTunnel = true;
    }
    if (process.env.DEV_SERVER_PORT) {
        options.port = parseInt(process.env.DEV_SERVER_PORT, 10);
    }
    if (process.env.DEV_SERVER_VERBOSE === 'true') {
        options.verbose = true;
    }
    if (process.env.DEV_SERVER_BUILD_DIR) {
        options.buildDir = process.env.DEV_SERVER_BUILD_DIR;
    }

    const devServer = new DevServer(options);
    devServer.setupSignalHandlers();
    devServer.start().catch(error => {
        console.error('Failed to start dev server:', error);
        process.exit(1);
    });
}

module.exports = DevServer;