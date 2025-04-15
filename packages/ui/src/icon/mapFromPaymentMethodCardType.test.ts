import { Component } from 'react';

import mapFromPaymentMethodCardType, {
    filterInstrumentTypes,
    getPaymentMethodIconComponent,
} from './mapFromPaymentMethodCardType';

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

    it('return undefined if no type is passed to getPaymentMethodIconComponent', () => {
        expect(getPaymentMethodIconComponent(undefined)).toBeUndefined();
    });

    it('returns a component if type is passed to getPaymentMethodIconComponent', () => {
        expect(getPaymentMethodIconComponent('troy')).toBeDefined();
    });

    it('filterInstrumentTypes from map', () => {
        const ids = ['troy', 'test'];

        expect(filterInstrumentTypes(ids)).toHaveLength(1);
    });
});
