import { hostedCreditCardIntegration } from './hosted-credit-card-integration';

describe('hostedCreditCard', () => {
    it('should work', () => {
        expect(hostedCreditCardIntegration()).toBe('hosted-credit-card-integration');
    });
});
