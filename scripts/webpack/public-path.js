const { default: InjectPlugin } = require('webpack-inject-plugin');

class PublicPathPlugin {
    apply(compiler) {
        const entryName = Object.keys(compiler.options.entry)[0];
        const injectPlugin = new InjectPlugin(() => this.generateCode(entryName));

        injectPlugin.apply(compiler);
    }

    generateCode(entryName) {
        return `
(function setPublicPath() {
    var script = document.currentScript || document.querySelector('script[src*="${entryName}"]');
    var path = script.src.split('/').slice(0, -1).join('/') + '/';

    __webpack_require__.p = path;
})();
        `;
    }
}

module.exports = PublicPathPlugin;
