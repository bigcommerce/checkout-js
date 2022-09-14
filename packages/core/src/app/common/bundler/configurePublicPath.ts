import getCurrentScriptPath from './getCurrentScriptPath';

export default function configurePublicPath(publicPath?: string): string {
    if (!publicPath) {
        const scriptPath = getCurrentScriptPath();

        if (!scriptPath) {
            throw new Error(
                'Unable to configure the public path of the application because it is not specified and it cannot be inferred using the path of the current script.',
            );
        }

        __webpack_public_path__ = `${scriptPath.split('/').slice(0, -1).join('/')}/`;

        return __webpack_public_path__;
    }

    __webpack_public_path__ = publicPath.substr(-1) === '/' ? publicPath : `${publicPath}/`;

    return __webpack_public_path__;
}
