#!/usr/bin/env node
const { appVersion } = require('../../dist/manifest.json');

process.stdout.write(appVersion);
