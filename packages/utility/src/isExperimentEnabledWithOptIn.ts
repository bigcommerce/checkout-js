import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS } from './experiments/customCheckoutExperimentOptIns';
import { CUSTOM_CHECKOUT_READY_EXPERIMENTS } from './experiments/customCheckoutReadyExperiments';
import isExperimentEnabled from './isExperimentEnabled';

/**
 * Use for every new experiment. New experiments are OFF for custom checkouts
 * unless the custom checkout opts in.
 *
 * - Default checkout: follows the experiment, OFF if the flag is missing.
 * - Custom checkout (or unknown, e.g. an older backend): OFF unless the
 *   experiment is listed in both `CUSTOM_CHECKOUT_READY_EXPERIMENTS` and
 *   `CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS`. When listed in both, it follows the
 *   rollout for the store. If the flag is missing, it stays ON: a ready
 *   experiment's flag is only missing once it has been removed.
 */
export function isExperimentEnabledWithOptIn(
    checkoutSettings: CheckoutSettings | undefined,
    experimentName: string,
): boolean {
    const isCustomCheckout = checkoutSettings?.isCustomCheckout ?? true;

    if (!isCustomCheckout) {
        return isExperimentEnabled(checkoutSettings, experimentName, false);
    }

    return (
        CUSTOM_CHECKOUT_READY_EXPERIMENTS.includes(experimentName) &&
        CUSTOM_CHECKOUT_EXPERIMENT_OPT_INS.includes(experimentName) &&
        isExperimentEnabled(checkoutSettings, experimentName, true)
    );
}
