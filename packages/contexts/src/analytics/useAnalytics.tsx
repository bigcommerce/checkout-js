import { useContext, useMemo } from 'react';

import AnalyticsContext from './AnalyticsContext';

const useAnalytics = () => {
    const analyticsContext = useContext(AnalyticsContext);

    if (!analyticsContext) {
        throw new Error('useAnalytics must be used within an <AnalyticsProvider>');
    }

    return useMemo(
        () => ({
            analyticsTracker: analyticsContext.analyticsTracker,
        }),
        [analyticsContext],
    );
};

export default useAnalytics;
