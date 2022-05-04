import { expect , test as base } from '@playwright/test';

import { PaymentStep } from '.';

interface CheckoutFixtures {
    paymentStep: PaymentStep;
}

export const test = base.extend<CheckoutFixtures>({
    // TODO: add customerStep
    paymentStep: async ({ page }, use) => {
        const paymentStep = new PaymentStep(page);
        await use(paymentStep);
        await paymentStep.close();
    },
});

export { expect };
