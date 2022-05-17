const { noop } = require('lodash');
const { exec } = require('child_process');

class BuildHookPlugin {
    constructor({ onDone = noop, onSuccess = noop, onError = noop, onBeforeCompile } = {}) {
        this.onDone = onDone;
        this.onError = onError;
        this.onSuccess = onSuccess;
        this.onBeforeCompile = onBeforeCompile;
    }

    apply(compiler) {
        if (process.env.WEBPACK_DONE) {
            compiler.hooks.done.tapPromise('BuildHooks', this.process(process.env.WEBPACK_DONE));
        }

        compiler.hooks.done.tap('BuildHooks', ({ compilation: { errors = [] } }) => {
            if (!errors.length) {
                this.onSuccess();
            } else {
                this.onError(errors);
            }

            this.onDone();
        });

        if (this.onBeforeCompile) {
            compiler.hooks.beforeCompile.tapPromise('BuildHooks', this.onBeforeCompile);
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
