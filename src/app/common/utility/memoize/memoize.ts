import { memoize as lodashMemoize } from 'lodash';

import CacheKeyResolver from './CacheKeyResolver';

export interface MemoizeOptions {
    maxSize?: number;
}

export default function memoize<T extends (...args: any) => any>(
    fn: T,
    options?: MemoizeOptions
) {
    const { maxSize } = { maxSize: 1, ...options };
    const cache = new Map();
    const resolver = new CacheKeyResolver({
        maxSize,
        onExpire: key => cache.delete(key),
    });
    const memoized = lodashMemoize(fn, (...args) => resolver.getKey(...args));

    memoized.cache = cache;

    return memoized;
}
