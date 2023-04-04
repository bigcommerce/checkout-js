import {
    CustomerStepPreset,
    test,
} from '@bigcommerce/checkout/payment-integration-test-framework';

interface timings {
    goto:number;
    doc:number;
    load:number;
    done:number
}

const data:timings[] = [];

function calculateTimings(timings:timings) {
    let timeToDoc = 0;
    let timeToLoad = 0;
    let timeToDone = 0;

    data.push(timings);

    for (const item of data) {
        timeToDoc =+ item.doc - item.goto;
        timeToLoad =+ item.load - item.goto;
        timeToDone =+ item.done - item.goto;
    }

    console.log(`Time to DOMContentLoaded: ${timeToDoc/data.length}ms`);
    console.log(`Time to Load: ${timeToLoad/data.length}ms`);
    console.log(`Time to Done: ${timeToDone/data.length}ms`);
}

test.describe('Sample Test Group', () => {
    test('Bigpay Test Payment Provider is working', async ({ checkout, page }) => {
        const timings:timings = {
            goto:0,
            doc:0,
            load:0,
            done:0
        };

        page.on('domcontentloaded', () => {
            timings.doc = Date.now();
        });
        page.on('load', () => {
            timings.load = Date.now();
        });

        // Testing environment setup
        await checkout.use(new CustomerStepPreset());

        timings.goto = Date.now();

        await checkout.start('Measure Loading Time');

        // Playwright actions
        await checkout.goto();
        await page.locator('#email').fill('test@example.com');

        timings.done = Date.now();

        calculateTimings(timings);
    });
});
