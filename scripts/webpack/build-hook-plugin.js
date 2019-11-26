const { exec } = require('child_process');

class BuildHookPlugin {
    constructor({ onDone } = {}) {
        this.onDone = onDone;
    }

    apply(compiler) {
        if (process.env.WEBPACK_DONE) {
            compiler.hooks.done.tapPromise('BuildHooks', this.process(process.env.WEBPACK_DONE));
        }

        if (this.onDone) {
            compiler.hooks.done.tap('BuildHooks', this.onDone);
        }
    }

    process(command) {
        return () => new Promise(resolve => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    throw err;
                }

                if (stderr) {
                    throw new Error(stderr);
                }

                const cleanOutput = stdout.trim();

                if (cleanOutput) {
                    console.log(cleanOutput.replace(/^/gm, '❯ '));
                }

                resolve();
            });
        });
    }
}

module.exports = BuildHookPlugin;
