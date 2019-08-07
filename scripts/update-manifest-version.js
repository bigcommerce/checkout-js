#!/bin/env node
const { join } = require('path');
const { writeFileSync } = require('fs');

const baseDir = join(__dirname, '..');

const manifestFile = join(baseDir, 'dist', 'manifest.json');
const manifest = require(manifestFile);

const { version } = require(join(baseDir, 'package.json'));

manifest.appVersion = version;

writeFileSync(manifestFile, JSON.stringify(manifest));
