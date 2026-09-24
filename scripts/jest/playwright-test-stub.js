// `@playwright/test` pulls in playwright-core's browser-automation runtime, which is not
// safe to evaluate under Jest's jsdom environment (see CHECKOUT-10435). Jest never runs
// Playwright fixtures/assertions itself - those only execute under `npx playwright test` -
// so modules that import `test`/`expect`/`request` purely to compose e2e fixtures can load
// this stub instead without triggering playwright-core's module-load crash.
const test = {
    extend: () => test,
};

const expect = () => ({});

const request = {
    newContext: () => Promise.resolve({}),
};

module.exports = { test, expect, request };
