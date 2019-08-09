import mapFromInstrumentCardType from './mapFromInstrumentCardType';

describe('mapFromInstrumentCardType()', () => {
    it('maps american express card type', () => {
        expect(mapFromInstrumentCardType('amex'))
            .toEqual('american-express');

        expect(mapFromInstrumentCardType('american_express'))
            .toEqual('american-express');
    });

    it('maps diners club card type', () => {
        expect(mapFromInstrumentCardType('diners'))
            .toEqual('diners-club');
    });

    it('does not map other card types', () => {
        expect(mapFromInstrumentCardType('visa'))
            .toEqual('visa');

        expect(mapFromInstrumentCardType('discover'))
            .toEqual('discover');
    });
});
