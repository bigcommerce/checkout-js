import mapFromInstrumentCardType from './mapFromInstrumentCardType';

describe('mapFromInstrumentCardType()', () => {
    it('maps american express card type', () => {
        expect(mapFromInstrumentCardType('amex')).toBe('american-express');

        expect(mapFromInstrumentCardType('american_express')).toBe('american-express');
    });

    it('maps diners club card type', () => {
        expect(mapFromInstrumentCardType('diners_club')).toBe('diners-club');

        expect(mapFromInstrumentCardType('diners')).toBe('diners-club');
    });

    it('does not map other card types', () => {
        expect(mapFromInstrumentCardType('visa')).toBe('visa');

        expect(mapFromInstrumentCardType('discover')).toBe('discover');
    });
});
