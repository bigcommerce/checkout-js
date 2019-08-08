import { CheckoutService } from '@bigcommerce/checkout-sdk';

import StepTracker from './StepTracker';
import StepTrackerFactory from './StepTrackerFactory';

export default function createTracker(checkoutService: CheckoutService): StepTracker {
    return new StepTrackerFactory(checkoutService).createTracker();
}
