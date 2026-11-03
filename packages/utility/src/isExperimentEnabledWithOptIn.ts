import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS } from './experiments/customCheckoutExperimentOptIns';
import isExperimentEnabled from './isExperimentEnabled';

/**
 * Use for every new experiment. New experiments are OFF for custom checkouts
 * unless the custom checkout opts in.
 *
 * - Default checkout: follows the experiment, OFF if the flag is missing.
 * - Custom checkout (or unknown, e.g. an older backend): OFF unless the
 *   experiment is listed in `CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS`. When listed,
 *   it follows the rollout for the store, and is OFF if the flag is missing.
 */
export function isExperimentEnabledWithOptIn(
    checkoutSettings: CheckoutSettings | undefined,
    experimentName: string,
): boolean {
    const isCustomCheckout = checkoutSettings?.isCustomCheckout ?? true;

    if (isCustomCheckout && !CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS.includes(experimentName)) {
        return false;
    }

    return isExperimentEnabled(checkoutSettings, experimentName, false);
}
