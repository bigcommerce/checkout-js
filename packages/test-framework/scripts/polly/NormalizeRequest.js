// Sourced from https://github.com/Netflix/pollyjs/blob/9b6bede12b7ee998472b8883c9dd01e2159e00a8/packages/%40pollyjs/core/src/utils/normalize-request.js

const stringify = require('fast-json-stable-stringify');
const isObjectLike = require('lodash/isObjectLike');

const HTTPHeaders = require('./HttpHeaders');
const parseUrl = require('./parseUrl');

function isFunction(fn) {
    return typeof fn === 'function';
}

function method(data, config, req) {
    return isFunction(config) ? config(method, req) : data.toUpperCase();
}

function url(data, config, req) {
    let parsedUrl = parseUrl(data, true);

    if (isFunction(config)) {
        parsedUrl = parseUrl(config(data, req), true);
    } else {
        // Remove any url properties that have been disabled via the config
        Object.keys(config || {}).forEach((key) => {
            if (isFunction(config[key])) {
                parsedUrl.set(key, config[key](parsedUrl[key], req));
            } else if (!config[key]) {
                parsedUrl.set(key, '');
            }
        });
    }

    // Sort Query Params
    if (isObjectLike(parsedUrl.query)) {
        parsedUrl.set('query', JSON.parse(stringify(parsedUrl.query)));
    }

    return parsedUrl.href;
}

function headers(data, config, req) {
    const normalizedHeaders = new HTTPHeaders(data);

    if (isFunction(config)) {
        return config(normalizedHeaders, req);
    }

    if (isObjectLike(config) && Array.isArray(config.exclude)) {
        config.exclude.forEach((header) => delete normalizedHeaders[header]);
    }

    return normalizedHeaders;
}

function body(data, config, req) {
    return isFunction(config) ? config(data, req) : data;
}

const NormalizeRequest = {
    headers,
    method,
    body,
    url,
};

module.exports = NormalizeRequest;
