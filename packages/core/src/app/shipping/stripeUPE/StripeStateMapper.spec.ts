import StripeStateMapper from './StripeStateMapper';

describe('hasSelectedShippingOptions()', () => {
    it('returns correct state code', () => {
        expect(StripeStateMapper('MX','Jal.'))
            .toEqual('JAL');
    });

    it('returns same state code with invalid country', () => {
        expect(StripeStateMapper('AU','Foo'))
            .toEqual('Foo');
    });

    it('returns same state code with valid country but invalid state', () => {
        expect(StripeStateMapper('MX','Foo'))
            .toEqual('Foo');
    });
});
