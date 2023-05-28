import { test as base, expect } from '@playwright/test';

import { Assertions, Checkout } from '.';

interface CheckoutFixtures {
    assertions: Assertions;
    checkout: Checkout;
}

export const test = base.extend<CheckoutFixtures>({
    assertions: async ({ page }, use) => {
        const assertions = new Assertions(page);

        await use(assertions);
    },
    checkout: async ({ page }, use, testInfo) => {
        const checkout = new Checkout(page);

        checkout.setHarFolderPath(testInfo.file);
        await use(checkout);
        await checkout.close();
    },
});

export { expect };
