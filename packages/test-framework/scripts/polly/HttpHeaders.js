// Sourced from https://github.com/Netflix/pollyjs/blob/9b6bede12b7ee998472b8883c9dd01e2159e00a8/packages/%40pollyjs/core/src/utils/http-headers.js

const isObjectLike = require('lodash/isObjectLike');

const HANDLER = {
    get(obj, prop) {
        // `prop` can be a Symbol so only lower-case string based props.
        return obj[typeof prop === 'string' ? prop.toLowerCase() : prop];
    },

    set(obj, prop, value) {
        if (typeof prop !== 'string') {
            return false;
        }

        if (value === null || typeof value === 'undefined') {
            delete obj[prop.toLowerCase()];
        } else {
            obj[prop.toLowerCase()] = value;
        }

        return true;
    },

    deleteProperty(obj, prop) {
        if (typeof prop !== 'string') {
            return false;
        }

        delete obj[prop.toLowerCase()];

        return true;
    },
};

function HTTPHeaders(headers) {
    const proxy = new Proxy({}, HANDLER);

    if (isObjectLike(headers)) {
        JSON.keys(headers).forEach((h) => (proxy[h] = headers[h]));
    }

    return proxy;
}

module.exports = HTTPHeaders;
