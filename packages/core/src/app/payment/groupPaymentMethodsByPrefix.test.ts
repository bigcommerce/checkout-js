import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import { groupPaymentMethodsByPrefix } from './groupPaymentMethodsByPrefix';

describe('groupMethodsByPrefix', () => {
    const facilypayMethod = (id: string, displayName: string): PaymentMethod => ({
        ...getPaymentMethod(),
        id,
        gateway: 'adyenv3',
        method: 'scheme',
        type: 'PAYMENT_TYPE_API',
        config: {
            ...getPaymentMethod().config,
            displayName,
        },
    });

    it('returns the same list when no methods match the prefix', () => {
        const methods: PaymentMethod[] = [facilypayMethod('scheme', 'Card')];
        const result = groupPaymentMethodsByPrefix(methods, 'facilypay_');

        expect(result).toEqual(methods);
    });

    it('returns the same list when only one method matches the prefix', () => {
        const methods: PaymentMethod[] = [facilypayMethod('facilypay_6', '6x Oney')];
        const result = groupPaymentMethodsByPrefix(methods, 'facilypay_');

        expect(result).toEqual(methods);
    });

    it('merges multiple prefixed methods into one representative ordered by numeric suffix', () => {
        const three = facilypayMethod('facilypay_3', '3x Oney');
        const twelve = facilypayMethod('facilypay_12', '12x Oney');
        const other = facilypayMethod('scheme', 'Card');

        const result = groupPaymentMethodsByPrefix([twelve, three, other], 'facilypay_');

        expect(result.map((m) => m.id)).toEqual(['facilypay_3', 'scheme']);

        const representative = result.find((m) => m.id === 'facilypay_3');

        expect(representative?.initializationData).toEqual(
            expect.objectContaining({
                groupedMethods: [three, twelve],
            }),
        );
    });

    it('strips a leading Nx multiplier from the representative display name', () => {
        const three = facilypayMethod('facilypay_3', '3x Oney label');
        const four = facilypayMethod('facilypay_4', '4x Oney other');

        const result = groupPaymentMethodsByPrefix([four, three], 'facilypay_');
        const representative = result.find((m) => m.id === 'facilypay_3');

        expect(representative?.config.displayName).toBe('Oney label');
    });
});
