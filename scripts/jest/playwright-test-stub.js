// Stubs `@playwright/test` for Jest, since playwright-core's runtime crashes under jsdom
// and Jest never actually executes Playwright fixtures/assertions (only `npx playwright test` does).
const test = {
    extend: () => test,
};

const expect = () => ({});

const request = {
    newContext: () => Promise.resolve({}),
};

module.exports = { test, expect, request };
