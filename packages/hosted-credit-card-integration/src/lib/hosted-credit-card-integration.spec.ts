import { hostedCreditCardIntegration } from './hosted-credit-card-integration';

describe('hostedCreditCard', () => {
    it('should work', () => {
        expect(hostedCreditCardIntegration()).toEqual('hosted-credit-card-integration');
    })
})
