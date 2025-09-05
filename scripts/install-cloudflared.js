#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const access = promisify(fs.access);
const chmod = promisify(fs.chmod);

class CloudflaredInstaller {
    constructor() {
        this.cloudflaredPath = '/tmp/cloudflared';
    }

    async isCloudflaredInstalled() {
        try {
            await access(this.cloudflaredPath, fs.constants.F_OK | fs.constants.X_OK);
            return true;
        } catch {
            return false;
        }
    }

    async downloadCloudflared() {
        return new Promise((resolve, reject) => {
            console.log('📥 Downloading cloudflared...');
            
            const url = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64';
            const file = fs.createWriteStream(this.cloudflaredPath);
            
            https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    https.get(response.headers.location, (redirectResponse) => {
                        redirectResponse.pipe(file);
                        file.on('finish', async () => {
                            file.close();
                            try {
                                await chmod(this.cloudflaredPath, 0o755);
                                console.log('✅ Cloudflared downloaded and made executable');
                                resolve();
                            } catch (error) {
                                reject(new Error(`Failed to make cloudflared executable: ${error.message}`));
                            }
                        });
                    }).on('error', reject);
                } else {
                    response.pipe(file);
                    file.on('finish', async () => {
                        file.close();
                        try {
                            await chmod(this.cloudflaredPath, 0o755);
                            console.log('✅ Cloudflared downloaded and made executable');
                            resolve();
                        } catch (error) {
                            reject(new Error(`Failed to make cloudflared executable: ${error.message}`));
                        }
                    });
                }
            }).on('error', reject);
        });
    }

    async install() {
        const isInstalled = await this.isCloudflaredInstalled();
        
        if (isInstalled) {
            console.log('✅ Cloudflared is already installed');
            return;
        }

        try {
            await this.downloadCloudflared();
        } catch (error) {
            console.error('❌ Failed to install cloudflared:', error.message);
            console.log('💡 You can manually download cloudflared from:');
            console.log('   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
            throw error;
        }
    }
}

// CLI interface
if (require.main === module) {
    const installer = new CloudflaredInstaller();
    installer.install().catch(error => {
        process.exit(1);
    });
}

module.exports = CloudflaredInstaller;