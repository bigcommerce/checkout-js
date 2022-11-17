import { Promotion } from '@bigcommerce/checkout-sdk';

export function getPromotion(): Promotion {
    return {
        banners: [
            { type: 'upsell', text: 'Get a discount if you order more' },
            { type: 'eligible', text: 'You are eligible for a discount' },
        ],
    };
}
