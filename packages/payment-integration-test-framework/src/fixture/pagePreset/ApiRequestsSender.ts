import { Checkout } from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';

import { getStoreUrl } from "../";

import { ApiContextFactory } from './ApiContextFactory';

/**
 * @internal
 */
export class ApiRequestsSender {
    private readonly apiContextFactory: ApiContextFactory;
    private readonly page: Page;
    private readonly storeUrl: string;

    constructor(page: Page) {
        this.page = page;
        this.storeUrl = getStoreUrl();
        this.apiContextFactory = new ApiContextFactory();

        faker.setLocale('en_US');

        // hack for BC dev store's root certificate issue during recording HAR
        // https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    async setCurrency(code: string): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkoutId = await this.getCheckoutIdOrThrow();
        await apiContext.post(`./carts/${checkoutId}/currency`, {
            data: {currencyCode: code},
        });
    }

    async addPhysicalItemToCart(): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        await apiContext.post('./carts', {
                data: {locale: 'en', lineItems: [{quantity: 1, productId: 86}]},
        });
    }

    async completeCustomerStepAsGuest(): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkout = await this.getCheckoutOrThrow();
        await apiContext.post(`./checkouts/${checkout.id}/billing-address`, {
            data: {email: faker.internet.email('checkout')},
        });
    }

    async setShippingQuote(): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        await apiContext.get(`${this.storeUrl}/remote/v1/shipping-quote?city=NEW%20YORK&country_id=226&state_id=43&zip_code=10028`);
        await apiContext.post(`${this.storeUrl}/remote/v1/shipping-quote`, {
            data: {shipping_method: 0},
        });
    }

    async completeSingleShippingAndSkipToPaymentStep(): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkout = await this.getCheckoutOrThrow();

        // Set shipping address
        const stateCode = faker.address.stateAbbr();
        const cartWithConsignmentsResponse = await apiContext.post(`./checkouts/${checkout.id}/consignments`, {
            params: {include: 'consignments.availableShippingOptions'},
            data: [{
                address: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    company: faker.company.companyName(),
                    phone: faker.phone.phoneNumber('##########'),
                    address1: faker.address.streetName(),
                    address2: faker.address.secondaryAddress(),
                    city: faker.address.cityName(),
                    countryCode: 'US',
                    stateOrProvince: '',
                    postalCode: faker.address.zipCodeByState(stateCode),
                    shouldSaveAddress: true,
                    stateOrProvinceCode: stateCode,
                    customFields: [],
                },
                lineItems: [
                    {
                        itemId: checkout.cart.lineItems.physicalItems[0].id,
                        quantity: checkout.cart.lineItems.physicalItems[0].quantity,
                    },
                ],
            }],
        });

        // Select shipping option
        const cartWithConsignments = await cartWithConsignmentsResponse.json();
        const consignmentId = cartWithConsignments.consignments[0].id;
        const shippingOptionId = cartWithConsignments.consignments[0].availableShippingOptions[0].id;
        await apiContext.put(`./checkouts/${checkout.id}/consignments/${consignmentId}`, {
            params: {include: 'consignments.availableShippingOptions'},
            data: {shippingOptionId},
        });

        // Set billing address
        const billingAddressId = checkout.billingAddress?.id;
        await apiContext.put(`./checkouts/${checkout.id}/billing-address/${billingAddressId}`, {
            data: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: faker.internet.email('checkout'),
                company: faker.company.companyName(),
                address1: faker.address.streetName(),
                address2: faker.address.secondaryAddress(),
                city: faker.address.cityName(),
                stateOrProvinceCode: stateCode,
                countryCode: 'US',
                postalCode: faker.address.zipCodeByState(stateCode),
            },
        });
    }

    async dispose(): Promise<void> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        await apiContext.dispose();
    }

    private async getCheckoutIdOrThrow(): Promise<string> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const response = await apiContext.get(`./carts`);
        const carts = await response.json();
        for (const remoteCart of carts) {
            if (remoteCart.id) {
                return remoteCart.id;
            }
        }

        throw new Error(`ApiContext cannot get checkoutId from the dev store.`);
    }

    private async getCheckoutOrThrow(): Promise<Checkout> {
        const apiContext = await this.apiContextFactory.create(this.page, this.storeUrl);
        const checkoutId = await this.getCheckoutIdOrThrow();
        const response = await apiContext.get(`./checkouts/${checkoutId}`);
        const checkout = await response.json();
        if (checkout.id) {
            return checkout;
        }

        throw new Error(`ApiContext cannot get checkout details from the dev store.`);
    }
}
