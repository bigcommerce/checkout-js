import { filterInstrumentTypes, mapFromPaymentMethodCardType } from '.';

describe('mapFromPaymentMethodCardType()', () => {
    it('maps from payment method card type', () => {
        expect(mapFromPaymentMethodCardType('AMEX')).toBe('american-express');

        expect(mapFromPaymentMethodCardType('DINERS')).toBe('diners-club');

        expect(mapFromPaymentMethodCardType('DISCOVER')).toBe('discover');

        expect(mapFromPaymentMethodCardType('JCB')).toBe('jcb');

        expect(mapFromPaymentMethodCardType('MAESTRO')).toBe('maestro');

        expect(mapFromPaymentMethodCardType('MC')).toBe('mastercard');

        expect(mapFromPaymentMethodCardType('CUP')).toBe('unionpay');

        expect(mapFromPaymentMethodCardType('VISA')).toBe('visa');

        expect(mapFromPaymentMethodCardType('CB')).toBe('cb');

        expect(mapFromPaymentMethodCardType('MADA')).toBe('mada');

        expect(mapFromPaymentMethodCardType('DANKORT')).toBe('dankort');

        expect(mapFromPaymentMethodCardType('CARNET')).toBe('carnet');

        expect(mapFromPaymentMethodCardType('ELO')).toBe('elo');

        expect(mapFromPaymentMethodCardType('HIPER')).toBe('hiper');

        expect(mapFromPaymentMethodCardType('TROY')).toBe('troy');
    });

    it('returns undefined if unable to map type', () => {
        expect(mapFromPaymentMethodCardType('FOOBAR')).toBeUndefined();
    });
});

describe('filterInstrumentTypes', () => {
    it('should return an array', () => {
        const result = filterInstrumentTypes([]);

        expect(Array.isArray(result)).toBe(true);
    });

    it('should filter out unsupported instrument types', () => {
        const inputTypes = ['bitcoin', 'unsupported-type'];
        const result = filterInstrumentTypes(inputTypes);

        expect(result).toEqual(['bitcoin']);
    });

    it('should return all supported types when all provided types are supported', () => {
        const inputTypes = ['bitcoin', 'visa', 'mastercard'];
        const result = filterInstrumentTypes(inputTypes);

        expect(result).toEqual(inputTypes);
    });

    it('should return an empty array when no supported types are provided', () => {
        const inputTypes = ['unsupported-type-1', 'unsupported-type-2'];
        const result = filterInstrumentTypes(inputTypes);

        expect(result).toEqual([]);
    });
});
