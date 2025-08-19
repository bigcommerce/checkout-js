import { type Checkout } from '@bigcommerce/checkout-sdk';

import { getPreselectedPayment } from '../payment';

import getBillingMethodId from './getBillingMethodId';

jest.mock('../payment');

describe('getBillingMethodId', () => {
    it('should return the providerId if it is in the BILLING_METHOD_IDS', () => {
        (getPreselectedPayment as jest.Mock).mockReturnValue({ providerId: 'amazonpay' });

        const checkout = {} as Checkout;
        const result = getBillingMethodId(checkout);

        expect(result).toBe('amazonpay');
    });

    it('should return undefined if the providerId is not in the BILLING_METHOD_IDS', () => {
        (getPreselectedPayment as jest.Mock).mockReturnValue({ providerId: 'paypal' });

        const checkout = {} as Checkout;
        const result = getBillingMethodId(checkout);

        expect(result).toBeUndefined();
    });

    it('should return undefined if there is no preselected payment', () => {
        (getPreselectedPayment as jest.Mock).mockReturnValue(undefined);

        const checkout = {} as Checkout;
        const result = getBillingMethodId(checkout);

        expect(result).toBeUndefined();
    });
});
