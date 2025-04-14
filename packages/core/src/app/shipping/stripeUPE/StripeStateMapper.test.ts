import StripeStateMapper from './StripeStateMapper';

describe('hasSelectedShippingOptions()', () => {
    it('returns correct state code', () => {
        expect(StripeStateMapper('MX','Jal.'))
            .toBe('JAL');
    });

    it('returns correct Stripe state code', () => {
        expect(StripeStateMapper('MX','JAL'))
            .toBe('Jal.');
    });

    it('returns same state code with invalid country', () => {
        expect(StripeStateMapper('AU','Foo'))
            .toBe('Foo');
    });

    it('returns same state code with valid country but invalid state', () => {
        expect(StripeStateMapper('MX','Foo'))
            .toBe('Foo');
    });
});
