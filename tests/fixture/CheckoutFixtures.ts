import { expect , test as base } from '@playwright/test';

import { Assertions, PaymentStep } from '.';

interface CheckoutFixtures {
    assertions: Assertions;
    paymentStep: PaymentStep;
}

export const test = base.extend<CheckoutFixtures>({
    assertions: async ({ page }, use) => {
        const assertions = new Assertions(page);
        await use(assertions);
    },
    paymentStep: async ({ page }, use) => {
        const paymentStep = new PaymentStep(page);
        await use(paymentStep);
        await paymentStep.close();
    },
    // TODO: add customerStep
});

export { expect };
