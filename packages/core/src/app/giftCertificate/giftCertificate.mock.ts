import { GiftCertificate } from '@bigcommerce/checkout-sdk';

export function getGiftCertificate(): GiftCertificate {
    return {
        code: 'savebig2015',
        remaining: 20,
        used: 80,
        balance: 100,
        purchaseDate: '',
    };
}
