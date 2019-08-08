import { createCheckoutService, CheckoutService, StoreConfig } from '@bigcommerce/checkout-sdk';

import AnalyticsStepTracker, { AnalyticsTracker, AnalyticsTrackerWindow } from './AnalyticsStepTracker';
import NoopStepTracker from './NoopStepTracker';
import StepTrackerFactory from './StepTrackerFactory';

declare let window: AnalyticsTrackerWindow;

describe('ErrorLoggerFactory', () => {
    let factory: StepTrackerFactory;
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        factory = new StepTrackerFactory(checkoutService);
    });

    describe('#createTracker()', () => {
        describe('when window.analytics is undefined', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                    checkoutSettings: {
                        isAnalyticsEnabled: true,
                    },
                } as StoreConfig);
            });

            it('returns instance of noop logger', () => {
                expect(factory.createTracker()).toBeInstanceOf(NoopStepTracker);
            });
        });

        describe('when analytics settings is disabled', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                    checkoutSettings: {
                        isAnalyticsEnabled: false,
                    },
                } as StoreConfig);

                window.analytics = {} as AnalyticsTracker;
            });

            it('returns instance of noop logger', () => {
                expect(factory.createTracker()).toBeInstanceOf(NoopStepTracker);
            });
        });

        describe('when window.analytics is defined and analytics setting enabled', () => {
            beforeEach(() => {
                jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                    checkoutSettings: {
                        isAnalyticsEnabled: true,
                    },
                } as StoreConfig);

                window.analytics = {} as AnalyticsTracker;
            });

            it('returns instance of AnalyticsStepTracker', () => {
                expect(factory.createTracker()).toBeInstanceOf(AnalyticsStepTracker);
            });
        });
    });
});
