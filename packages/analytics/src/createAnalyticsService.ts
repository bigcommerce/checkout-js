export default function createAnalyticsService<T>(
    createFn: (args?: any) => T,
    createArguments: unknown[] = [],
) {
    let analyticsTracker: T;

    return () => {
        if (analyticsTracker) {
            return analyticsTracker;
        }

        analyticsTracker = createFn(...createArguments);

        return analyticsTracker;
    };
}
