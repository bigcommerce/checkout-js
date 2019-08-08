import { CheckoutService } from '@bigcommerce/checkout-sdk';
import localStorageFallback from 'local-storage-fallback';

import AnalyticsStepTracker, { isAnalyticsTrackerWindow } from './AnalyticsStepTracker';
import NoopStepTracker from './NoopStepTracker';
import StepTracker from './StepTracker';

export default class StepTrackerFactory {
    constructor(
        private checkoutService: CheckoutService
    ) {}

    createTracker(): StepTracker {
        const { data } = this.checkoutService.getState();
        const config = data.getConfig();

        if (!config) {
            throw new Error('Missing configuration data');
        }

        const { isAnalyticsEnabled } = config.checkoutSettings;

        if (isAnalyticsEnabled && isAnalyticsTrackerWindow(window)) {
            return new AnalyticsStepTracker(
                this.checkoutService,
                localStorageFallback,
                window.sessionStorage,
                window.analytics
            );
        }

        return new NoopStepTracker();
    }
}
