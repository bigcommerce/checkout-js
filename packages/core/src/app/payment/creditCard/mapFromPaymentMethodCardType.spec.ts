import mapFromPaymentMethodCardType from './mapFromPaymentMethodCardType';

describe('mapFromPaymentMethodCardType()', () => {
    it('maps from payment method card type', () => {
        expect(mapFromPaymentMethodCardType('AMEX'))
            .toEqual('american-express');

        expect(mapFromPaymentMethodCardType('DINERS'))
            .toEqual('diners-club');

        expect(mapFromPaymentMethodCardType('DISCOVER'))
            .toEqual('discover');

        expect(mapFromPaymentMethodCardType('JCB'))
            .toEqual('jcb');

        expect(mapFromPaymentMethodCardType('MAESTRO'))
            .toEqual('maestro');

        expect(mapFromPaymentMethodCardType('MC'))
            .toEqual('mastercard');

        expect(mapFromPaymentMethodCardType('CUP'))
            .toEqual('unionpay');

        expect(mapFromPaymentMethodCardType('VISA'))
            .toEqual('visa');

        expect(mapFromPaymentMethodCardType('CB'))
            .toEqual('cb');

        expect(mapFromPaymentMethodCardType('MADA'))
            .toEqual('mada');

        expect(mapFromPaymentMethodCardType('DANKORT'))
            .toEqual('dankort');

        expect(mapFromPaymentMethodCardType('CARNET'))
            .toEqual('carnet');

        expect(mapFromPaymentMethodCardType('ELO'))
            .toEqual('elo');

        expect(mapFromPaymentMethodCardType('HIPER'))
            .toEqual('hiper');

        expect(mapFromPaymentMethodCardType('TROY'))
            .toEqual('troy');
    });

    it('returns undefined if unable to map type', () => {
        expect(mapFromPaymentMethodCardType('FOOBAR'))
            .toEqual(undefined);
    });
});
