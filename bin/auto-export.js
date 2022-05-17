#!/usr/bin/env node
const yargs = require('yargs');
const autoExport = require('../scripts/webpack/auto-export');

(async function() {
    const argv = yargs
        .option('config', {
            describe: 'The config file specifying which files to re-export and to where',
            default: '../auto-export.config.json'
        })
        .argv;

    try {
        const config = require(argv.config);

        await Promise.all(
            config.entries.map(async entry => {
                await autoExport(entry);
                console.log(`Modules are exported at '${entry.outputPath}'`);
            })
        );

        process.exit(0);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
})();
