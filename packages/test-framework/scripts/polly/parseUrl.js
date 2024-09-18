// Sourced from https://github.com/Netflix/pollyjs/blob/9b6bede12b7ee998472b8883c9dd01e2159e00a8/packages/%40pollyjs/core/src/utils/parse-url.js

const { URL } = require('@pollyjs/utils');

function isAbsoluteUrl(url) {
    if (typeof url !== 'string') {
        throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
    }

    if (/^[a-zA-Z]:\\/.test(url)) {
        return false;
    }

    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

function removeHostFromUrl(url) {
    url.set('protocol', '');
    url.set('host', '');
    url.set('slashes', false);

    return url;
}

function parseUrl(url, ...args) {
    const parsedUrl = new URL(url, ...args);

    if (!isAbsoluteUrl(url)) {
        if (url.startsWith('//')) {
            parsedUrl.set('protocol', '');
        } else {
            removeHostFromUrl(parsedUrl);
        }
    }

    return parsedUrl;
}

module.exports = parseUrl;
