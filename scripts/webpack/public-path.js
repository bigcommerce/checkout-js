const { default: InjectPlugin } = require('webpack-inject-plugin');

class PublicPathPlugin {
    constructor(hash) {
        this.hash = hash;
    }

    apply(compiler) {
        const injectPlugin = new InjectPlugin(() => this.generateCode());

        injectPlugin.apply(compiler);
    }

    generateCode() {
        return `
(function setPublicPath() {
    var script = document.currentScript || document.querySelector('script[src*="${this.hash}"]');
    var path = script.src.split('/').slice(0, -1).join('/') + '/';

    __webpack_require__.p = path;
})();
        `;
    }
}

module.exports = PublicPathPlugin;
