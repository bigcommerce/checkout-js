import { methodNavigatesAway } from './methodNavigatesAway';
import { PaymentMethodId, PaymentMethodProviderType } from './paymentMethod';

const methodsWhichNavigateAway = [
    { id: '1234', type: PaymentMethodProviderType.PPSDK },
    { id: '1234', type: PaymentMethodProviderType.Hosted },
    { id: PaymentMethodId.Amazon, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.AmazonPay, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.Checkoutcom, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.Converge, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.Laybuy, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.Quadpay, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.SagePay, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.Sezzle, type: PaymentMethodProviderType.Api },
    { id: PaymentMethodId.Zip, type: PaymentMethodProviderType.Api },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.AdyenV2 },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.AdyenV2GooglePay },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.Afterpay },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.Clearpay },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.Checkoutcom },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.Mollie },
    { id: '123', type: PaymentMethodProviderType.Api, gateway: PaymentMethodId.StripeV3 },
];

const methodsWhichRemain = [
    { id: '1234', type: PaymentMethodProviderType.Api, gateway: 'gateway' },
    { id: '1234', type: PaymentMethodProviderType.Offline, gateway: 'gateway' },
];

describe('methodNavigatesAway', () => {
    it.each(methodsWhichNavigateAway)('returns true for %o', method => {
        expect(methodNavigatesAway(method)).toBe(true);
    });

    it.each(methodsWhichRemain)('returns false for %o', method => {
        expect(methodNavigatesAway(method)).toBe(false);
    });
});
