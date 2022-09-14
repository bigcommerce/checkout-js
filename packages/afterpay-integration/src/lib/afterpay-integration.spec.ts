import { afterpayIntegration } from './afterpay-integration';

describe('afterpayIntegration', () => {
    it('should work', () => {
        expect(afterpayIntegration()).toBe('afterpay-integration');
    });
});
