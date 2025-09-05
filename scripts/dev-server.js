#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const access = promisify(fs.access);

class DevServer {
    constructor(options = {}) {
        this.options = {
            port: options.port || 8080,
            enableTunnel: options.enableTunnel || false,
            cloudflaredPath: options.cloudflaredPath || '/tmp/cloudflared',
            buildDir: options.buildDir || 'build',
            verbose: options.verbose || false,
            ...options
        };
        
        this.processes = [];
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

    async checkCloudflaredAvailable() {
        try {
            await access(this.options.cloudflaredPath, fs.constants.F_OK | fs.constants.X_OK);
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

    startHttpServer() {
        return new Promise((resolve, reject) => {
            this.log(`Starting HTTP server on port ${this.options.port}...`);
            
            const serverProcess = spawn('npx', ['http-server', this.options.buildDir, '--cors', '-p', this.options.port.toString()], {
                stdio: ['inherit', 'pipe', 'pipe'],
                cwd: process.cwd()
            });

            this.processes.push(serverProcess);

            serverProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (this.options.verbose) {
                    process.stdout.write(`[HTTP Server] ${output}`);
                }

                // Look for server start indicators
                if (output.includes('Available on:') || output.includes(`http://127.0.0.1:${this.options.port}`)) {
                    this.log(`HTTP server ready on http://localhost:${this.options.port}`, true);
                    this.serverReady = true;
                    resolve();
                }
            });

            serverProcess.stderr.on('data', (data) => {
                const output = data.toString();
                if (this.options.verbose || output.includes('ERROR') || output.includes('EADDRINUSE')) {
                    process.stderr.write(`[HTTP Server] ${output}`);
                }
                
                if (output.includes('EADDRINUSE')) {
                    reject(new Error(`Port ${this.options.port} is already in use`));
                }
            });

            serverProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`HTTP server process exited with code ${code}`));
                }
            });

            // Fallback timeout
            setTimeout(() => {
                if (!this.serverReady) {
                    this.log('HTTP server timeout reached, assuming ready', true);
                    this.serverReady = true;
                    resolve();
                }
            }, 10000); // 10 second timeout
        });
    }

    async startCloudflaredTunnel() {
        if (!this.options.enableTunnel) {
            return;
        }

        const cloudflaredAvailable = await this.checkCloudflaredAvailable();
        if (!cloudflaredAvailable) {
            this.error(`Cloudflared not found at ${this.options.cloudflaredPath}. Download it from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/`);
            return;
        }

        return new Promise((resolve, reject) => {
            this.log('Starting Cloudflare Tunnel...', true);
            
            const tunnelProcess = spawn(this.options.cloudflaredPath, ['tunnel', '--url', `http://localhost:${this.options.port}`], {
                stdio: ['inherit', 'pipe', 'pipe'],
                cwd: process.cwd()
            });

            this.processes.push(tunnelProcess);
            let tunnelStarted = false;

            tunnelProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (this.options.verbose) {
                    process.stdout.write(`[Cloudflared] ${output}`);
                }

                // Extract tunnel URL from cloudflared output
                const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
                if (urlMatch && !this.tunnelUrl) {
                    this.tunnelUrl = urlMatch[0];
                    this.log(`🌩️  Cloudflare Tunnel ready: ${this.tunnelUrl}`, true);
                    this.log(`🔗 Auto-loader URL: ${this.tunnelUrl}/auto-loader-dev.js`, true);
                    tunnelStarted = true;
                    resolve();
                }

                // Look for successful connection messages
                if (output.includes('Connection') && output.includes('registered')) {
                    tunnelStarted = true;
                }
            });

            tunnelProcess.stderr.on('data', (data) => {
                const output = data.toString();
                if (this.options.verbose || output.includes('error') || output.includes('failed')) {
                    process.stderr.write(`[Cloudflared] ${output}`);
                }

                // Handle common errors
                if (output.includes('failed to lookup TXT record') || output.includes('no such host')) {
                    this.log('⚠️  Cloudflare tunnel may need internet connectivity - continuing without tunnel', true);
                    if (!tunnelStarted) {
                        tunnelStarted = true;
                        resolve();
                    }
                }
            });

            tunnelProcess.on('close', (code) => {
                if (code !== 0 && !tunnelStarted) {
                    this.log(`⚠️  Cloudflare tunnel failed (exit code ${code}) - continuing without tunnel`, true);
                    this.log('💡 Tunnel requires internet connectivity. Local development server is still available.', true);
                    resolve();
                } else if (code !== 0) {
                    this.log(`Cloudflare tunnel process exited with code ${code}`, true);
                }
            });

            // Timeout for tunnel establishment
            setTimeout(() => {
                if (!tunnelStarted) {
                    this.log('⚠️  Cloudflare tunnel timeout - continuing without tunnel', true);
                    this.log('💡 This is normal in offline environments. Local server is ready at http://localhost:' + this.options.port, true);
                    resolve();
                }
            }, 20000); // 20 second timeout
        });
    }

    async start() {
        try {
            this.log('🚀 Starting development server...', true);
            
            // Start webpack and wait for initial build
            await this.startWebpack();
            
            // Start HTTP server
            await this.startHttpServer();
            
            // Start tunnel if enabled
            if (this.options.enableTunnel) {
                await this.startCloudflaredTunnel();
            }

            this.log('✅ Development server is ready!', true);
            this.log(`📁 Build directory: ${this.options.buildDir}`, true);
            this.log(`🌐 Local server: http://localhost:${this.options.port}`, true);
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
            case '--cloudflared-path':
                options.cloudflaredPath = args[++i];
                break;
            case '--help':
                console.log(`
Usage: node scripts/dev-server.js [options]

Options:
  --tunnel              Enable Cloudflare Tunnel for HTTPS access
  --port <number>       Port for HTTP server (default: 8080)
  --verbose             Enable verbose logging
  --cloudflared-path    Path to cloudflared binary (default: /tmp/cloudflared)
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
    if (process.env.CLOUDFLARED_PATH) {
        options.cloudflaredPath = process.env.CLOUDFLARED_PATH;
    }

    const devServer = new DevServer(options);
    devServer.setupSignalHandlers();
    devServer.start().catch(error => {
        console.error('Failed to start dev server:', error);
        process.exit(1);
    });
}

module.exports = DevServer;