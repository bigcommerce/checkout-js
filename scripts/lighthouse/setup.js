async function setup(browser) {
    const storeUrl = process.env.STORE_URL;
    const page = await browser.newPage();

    await page.goto(storeUrl);

    // Create a cart within the browser context
    await page.evaluate(async (host) => {
        const response = await fetch(`${host}/api/storefront/carts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                lineItems: [
                    {
                        productId: 103,
                        quantity: 1,
                    },
                ],
            }),
            credentials: 'include',
        });

        if (response.ok) {
            // eslint-disable-next-line no-console
            console.error(`Failed to create cart: ${response.statusText}`);

            return;
        }

        const data = await response.json();

        // eslint-disable-next-line no-console
        console.log('Cart created successfully. ID:', data.id);
    }, storeUrl);
}

module.exports = setup;
