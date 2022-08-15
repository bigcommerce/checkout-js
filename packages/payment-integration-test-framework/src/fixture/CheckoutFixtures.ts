import { expect , test as base } from '@playwright/test';

import { Assertions, Checkout } from '.';

interface CheckoutFixtures {
    assertions: Assertions;
    checkout: Checkout;
}

export const test = base.extend<CheckoutFixtures>({
    assertions: async ({page}, use) => {
        const assertions = new Assertions(page);
        await use(assertions);
    },
    checkout: async ({page}, use) => {
        const checkout = new Checkout(page);
        await use(checkout);
        await checkout.close();
    },
});

export { expect };
