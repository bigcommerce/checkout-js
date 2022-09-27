import mapToOrderRequestBody from './mapToOrderRequestBody';

describe('mapToOrderRequestBody()', () => {
    it('transforms credit card form values into order payload', () => {
        const result = mapToOrderRequestBody(
            {
                ccCvv: '123',
                ccExpiry: '12/23',
                ccName: 'Big Shopper',
                ccNumber: '4111 1111 1111 1111',
                shouldSaveInstrument: true,
                paymentProviderRadio: 'authorizenet',
            },
            true,
        );

        expect(result).toEqual({
            payment: {
                gatewayId: undefined,
                methodId: 'authorizenet',
                paymentData: {
                    ccCvv: '123',
                    ccExpiry: {
                        month: '12',
                        year: '2023',
                    },
                    ccName: 'Big Shopper',
                    ccNumber: '4111111111111111',
                    shouldSaveInstrument: true,
                },
            },
        });
    });

    it('transforms stored instrument form values into order payload', () => {
        const result = mapToOrderRequestBody(
            {
                ccCvv: '123',
                ccNumber: '4111 1111 1111 1111',
                instrumentId: 'abc',
                paymentProviderRadio: 'authorizenet',
            },
            true,
        );

        expect(result).toEqual({
            payment: {
                gatewayId: undefined,
                methodId: 'authorizenet',
                paymentData: {
                    ccCvv: '123',
                    ccNumber: '4111111111111111',
                    instrumentId: 'abc',
                },
            },
        });
    });

    it('transforms hosted / offsite / offline method form values into order payload', () => {
        const result = mapToOrderRequestBody(
            {
                paymentProviderRadio: 'adyen-paypal',
            },
            true,
        );

        expect(result).toEqual({
            payment: {
                gatewayId: 'adyen',
                methodId: 'paypal',
            },
        });
    });

    it('transforms form values into order payload for order that does not required additional payment details', () => {
        const result = mapToOrderRequestBody(
            {
                paymentProviderRadio: 'authorizenet',
            },
            false,
        );

        expect(result).toEqual({});
    });
});
