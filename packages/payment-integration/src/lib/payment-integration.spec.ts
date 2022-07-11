import { paymentIntegration } from './payment-integration';

describe('paymentIntegration', () => {
    it('should work', () => {
        expect(paymentIntegration()).toEqual('payment-integration');
    })
})