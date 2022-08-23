import { afterpayIntegration } from './afterpay-integration';

describe('afterpayIntegration', () => {
    it('should work', () => {
        expect(afterpayIntegration()).toEqual('afterpay-integration');
    })
})