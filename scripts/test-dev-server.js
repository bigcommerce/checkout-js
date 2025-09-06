#!/usr/bin/env node

/**
 * Quick test script to verify the dev server functionality
 */

const { spawn } = require('child_process');
const http = require('http');

async function testDevServer() {
    console.log('🧪 Testing listhen-based dev server functionality...');
    
    // Start the dev server
    const devServer = spawn('node', ['scripts/dev-server.js', '--port', '8081'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd()
    });

    let serverReady = false;
    
    // Wait for server to be ready
    const serverReadyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Server start timeout'));
        }, 120000); // 2 minutes timeout

        devServer.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('[DevServer]', output.trim());
            
            if (output.includes('Development server is ready!') && !serverReady) {
                serverReady = true;
                clearTimeout(timeout);
                resolve();
            }
        });

        devServer.stderr.on('data', (data) => {
            console.error('[DevServer Error]', data.toString().trim());
        });

        devServer.on('close', (code) => {
            if (code !== 0 && !serverReady) {
                clearTimeout(timeout);
                reject(new Error(`Dev server exited with code ${code}`));
            }
        });
    });

    try {
        await serverReadyPromise;
        console.log('✅ Listhen-based dev server started successfully');

        // Test HTTP endpoint
        console.log('🌐 Testing HTTP endpoint...');
        const testResponse = await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:8081/auto-loader-dev.js', (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ auto-loader-dev.js is accessible via listhen');
                    resolve(true);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
                res.resume(); // Consume response to free up memory
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('HTTP request timeout'));
            });
        });

        console.log('🎉 All tests passed! Listhen integration working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    } finally {
        // Clean up
        console.log('🧹 Cleaning up...');
        devServer.kill('SIGTERM');
        
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

if (require.main === module) {
    testDevServer().catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = testDevServer;