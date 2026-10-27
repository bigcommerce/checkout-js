import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS } from './experiments/customCheckoutExperimentOptIns';
import { CUSTOM_CHECKOUT_READY_EXPERIMENTS } from './experiments/customCheckoutReadyExperiments';
import { isExperimentEnabledWithOptIn } from './isExperimentEnabledWithOptIn';

const EXPERIMENT = 'PROJECT-1234.new_flag';

const getSettings = (
    isCustomCheckout: boolean | undefined,
    features: Record<string, boolean> = {},
): CheckoutSettings => ({
    ...getStoreConfig().checkoutSettings,
    isCustomCheckout,
    features,
});

describe('isExperimentEnabledWithOptIn', () => {
    afterEach(() => {
        CUSTOM_CHECKOUT_READY_EXPERIMENTS.length = 0;
        CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS.length = 0;
    });

    describe('default checkout', () => {
        it('returns the experiment value', () => {
            expect(
                isExperimentEnabledWithOptIn(
                    getSettings(false, { [EXPERIMENT]: true }),
                    EXPERIMENT,
                ),
            ).toBe(true);
            expect(
                isExperimentEnabledWithOptIn(
                    getSettings(false, { [EXPERIMENT]: false }),
                    EXPERIMENT,
                ),
            ).toBe(false);
        });

        it('returns false when the experiment is missing', () => {
            expect(isExperimentEnabledWithOptIn(getSettings(false), EXPERIMENT)).toBe(false);
        });

        it('ignores custom checkout opt-ins', () => {
            CUSTOM_CHECKOUT_READY_EXPERIMENTS.push(EXPERIMENT);
            CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS.push(EXPERIMENT);

            expect(
                isExperimentEnabledWithOptIn(
                    getSettings(false, { [EXPERIMENT]: false }),
                    EXPERIMENT,
                ),
            ).toBe(false);
        });
    });

    describe('custom checkout', () => {
        it('returns false when the experiment is on but the custom checkout has not opted in', () => {
            CUSTOM_CHECKOUT_READY_EXPERIMENTS.push(EXPERIMENT);

            expect(
                isExperimentEnabledWithOptIn(getSettings(true, { [EXPERIMENT]: true }), EXPERIMENT),
            ).toBe(false);
        });

        it('returns false when opted in but the experiment is not ready', () => {
            CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS.push(EXPERIMENT);

            expect(
                isExperimentEnabledWithOptIn(getSettings(true, { [EXPERIMENT]: true }), EXPERIMENT),
            ).toBe(false);
        });

        describe('when opted in and the experiment is ready', () => {
            beforeEach(() => {
                CUSTOM_CHECKOUT_READY_EXPERIMENTS.push(EXPERIMENT);
                CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS.push(EXPERIMENT);
            });

            it('returns false while the rollout has not reached the store', () => {
                expect(
                    isExperimentEnabledWithOptIn(
                        getSettings(true, { [EXPERIMENT]: false }),
                        EXPERIMENT,
                    ),
                ).toBe(false);
            });

            it('returns true once the rollout reaches the store', () => {
                expect(
                    isExperimentEnabledWithOptIn(
                        getSettings(true, { [EXPERIMENT]: true }),
                        EXPERIMENT,
                    ),
                ).toBe(true);
            });

            it('returns true when the experiment has been removed', () => {
                expect(isExperimentEnabledWithOptIn(getSettings(true), EXPERIMENT)).toBe(true);
            });
        });
    });

    describe('unknown checkout type', () => {
        it('treats missing isCustomCheckout as a custom checkout', () => {
            expect(
                isExperimentEnabledWithOptIn(
                    getSettings(undefined, { [EXPERIMENT]: true }),
                    EXPERIMENT,
                ),
            ).toBe(false);
        });

        it('treats missing checkout settings as a custom checkout', () => {
            expect(isExperimentEnabledWithOptIn(undefined, EXPERIMENT)).toBe(false);
        });
    });
});
