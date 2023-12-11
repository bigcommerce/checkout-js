import { Cart, Checkout } from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';

import { getStoreUrl } from '../';

import { ApiContextFactory } from './ApiContextFactory';

/**
 * @internal
 */
export class ApiRequestsSender {
    private readonly apiContextFactory: ApiContextFactory;
    private readonly page: Page;
    private readonly storeUrl: string;
    private readonly startTime: number;

    constructor(page: Page) {
        this.startTime = Date.now();
        this.page = page;
        this.storeUrl = getStoreUrl();
        this.apiContextFactory = new ApiContextFactory();

        faker.setLocale('en_US');

        // hack for BC dev store's root certificate issue during recording HAR
        // https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        console.log(`\nCreating APIRequestContext for ${this.storeUrl}`);
    }

    async setCurrency(code: string): Promise<void> {
        console.log(`  - Setting currency as ${code}`);

        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkoutId = await this.getCheckoutIdOrThrow();

        await apiContext.post(`./carts/${checkoutId}/currency`, {
            data: { currencyCode: code },
        });
    }

    async addPhysicalItemToCart(quantity = 1): Promise<void> {
        console.log(`  - Adding productId=86 to cart`);

        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);

        await apiContext.post('./carts', {
            data: { locale: 'en', lineItems: [{ quantity, productId: 86 }] },
        });
    }

    async completeCustomerStepAsGuest(): Promise<void> {
        console.log(`  - Setting shopper email`);

        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkout = await this.getCheckoutOrThrow();
        const email = faker.internet.email('checkout');

        await apiContext.post(`./checkouts/${checkout.id}/billing-address`, {
            data: { email },
        });
    }

    async setShippingQuote(): Promise<void> {
        console.log(`  - Setting shipping quote`);

        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);

        await apiContext.get(
            `${this.storeUrl}/remote/v1/shipping-quote?city=NEW%20YORK&country_id=226&state_id=43&zip_code=10028`,
        );
        await apiContext.post(`${this.storeUrl}/remote/v1/shipping-quote`, {
            data: { shipping_method: 0 },
        });
    }

    async completeSingleShippingAndSkipToPaymentStep(countryCode = 'US'): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkout = await this.getCheckoutOrThrow();

        // Set shipping address
        console.log(`  - Setting shipping address`);

        const stateCode = faker.address.stateAbbr();
        const address = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            company: faker.company.companyName(),
            phone: faker.phone.phoneNumber('##########'),
            address1: faker.address.streetName(),
            address2: faker.address.secondaryAddress(),
            city: faker.address.cityName(),
            countryCode,
            stateOrProvince: '',
            postalCode: faker.address.zipCodeByState(stateCode),
            shouldSaveAddress: true,
            stateOrProvinceCode: stateCode,
            customFields: [],
        };
        const cartWithConsignmentsResponse = await apiContext.post(
            `./checkouts/${checkout.id}/consignments`,
            {
                params: { include: 'consignments.availableShippingOptions' },
                data: [
                    {
                        address,
                        lineItems: [
                            {
                                itemId: checkout.cart.lineItems.physicalItems[0].id,
                                quantity: checkout.cart.lineItems.physicalItems[0].quantity,
                            },
                        ],
                    },
                ],
            },
        );

        // Select shipping option
        console.log(`  - Selecting the first available shipping method`);

        const cartWithConsignments = await cartWithConsignmentsResponse.json();
        const consignmentId = cartWithConsignments.consignments[0].id;

        if (!cartWithConsignments.consignments[0].availableShippingOptions[0]) {
            throw new Error(
                `Unable to select a shipping option for the address: ${JSON.stringify(
                    address,
                )}.\nPlease check shipping configuration.`,
            );
        }

        const shippingOptionId =
            cartWithConsignments.consignments[0].availableShippingOptions[0].id;

        await apiContext.put(`./checkouts/${checkout.id}/consignments/${consignmentId}`, {
            params: { include: 'consignments.availableShippingOptions' },
            data: { shippingOptionId },
        });

        // Set billing address
        console.log(`  - Setting random billing address`);

        const billingAddressId = checkout.billingAddress?.id;

        await apiContext.put(
            `./checkouts/${checkout.id}/billing-address/${billingAddressId ?? ''}`,
            {
                data: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    email: faker.internet.email('checkout'),
                    company: faker.company.companyName(),
                    address1: faker.address.streetName(),
                    address2: faker.address.secondaryAddress(),
                    phone: faker.phone.phoneNumber('##########'),
                    city: faker.address.cityName(),
                    stateOrProvinceCode: stateCode,
                    countryCode,
                    postalCode: faker.address.zipCodeByState(stateCode),
                },
            },
        );
    }

    async dispose(message: string): Promise<void> {
        console.log(`Disposing APIRequestContext`);

        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);

        await apiContext.dispose();

        const time = Math.ceil((Date.now() - this.startTime) / 1000);

        console.log(`\x1b[32m\n  ${message} \x1b[0m\x1b[2m(${time}s)\x1b[0m`);
    }

    private async getCheckoutIdOrThrow(): Promise<string> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const response = await apiContext.get(`./carts`);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const carts = (await response.json()) as Cart[];

        for (const remoteCart of carts) {
            if (remoteCart.id) {
                return remoteCart.id;
            }
        }

        throw new Error(`APIRequestContext cannot get checkoutId from the dev store.`);
    }

    private async getCheckoutOrThrow(): Promise<Checkout> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkoutId = await this.getCheckoutIdOrThrow();
        const response = await apiContext.get(`./checkouts/${checkoutId}`);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const checkout = (await response.json()) as Checkout;

        if (checkout.id) {
            return checkout;
        }

        throw new Error(`APIRequestContext cannot get checkout details from the dev store.`);
    }
}
