class AsyncHookPlugin {
    constructor({ onRun }) {
        this.onRun = onRun;
    }

    apply(compiler) {
        const handleHook = (params, done) => {
            this.onRun({ compiler, done, params });
        };

        compiler.hooks.run.tapAsync('AsyncRunPlugin', handleHook);
        compiler.hooks.watchRun.tapAsync('AsyncRunPlugin', handleHook);
    }
}

module.exports = AsyncHookPlugin;
