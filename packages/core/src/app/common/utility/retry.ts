const DEFAULT_OPTIONS = {
    count: 5,
    interval: 1000,
};

export interface RetryOptions {
    count?: number;
    interval?: number;
}

export default async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
    const { count, interval } = { ...DEFAULT_OPTIONS, ...options };

    try {
        return await fn();
    } catch (error) {
        if (count === 1) {
            throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, interval));

        return retry(fn, { interval, count: count - 1 });
    }
}
