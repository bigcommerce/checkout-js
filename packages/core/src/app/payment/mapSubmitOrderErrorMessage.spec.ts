import { getLanguageService } from '@bigcommerce/checkout/locale';

import mapSubmitOrderErrorMessage, { mapSubmitOrderErrorTitle } from './mapSubmitOrderErrorMessage';

const translate = getLanguageService().translate;

describe('mapSubmitOrderErrorMessage()', () => {
    it('returns generic message when payment method is not initialized', () => {
        const message = mapSubmitOrderErrorMessage({ type: 'not_initialized' }, translate, false);

        expect(message).toEqual(translate('payment.payment_error'));
    });

    it('returns correct message when payment is cancelled', () => {
        const message = mapSubmitOrderErrorMessage({ type: 'payment_cancelled' }, translate, false);

        expect(message).toEqual(translate('payment.payment_cancelled'));
    });

    it('returns correct message when payment method is not valid', () => {
        const message = mapSubmitOrderErrorMessage(
            { type: 'payment_method_invalid' },
            translate,
            false,
        );

        expect(message).toEqual(translate('payment.payment_method_disabled_error'));
    });

    it('returns correct message when shopping cart changed', () => {
        const message = mapSubmitOrderErrorMessage({ type: 'cart_changed' }, translate, false);

        expect(message).toEqual(translate('shipping.cart_change_error'));
    });

    it('returns correct message when payment error order_could_not_be_finalized_error', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    type: 'order_could_not_be_finalized_error',
                },
                message: 'payment error message',
            },
            translate,
            false,
        );

        expect(message).toEqual(
            translate('payment.payment_method_error', { message: 'payment error message' }),
        );
    });

    it('returns correct message when payment error provider_fatal_error', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    type: 'provider_fatal_error',
                },
                message: 'payment error message',
            },
            translate,
            false,
        );

        expect(message).toEqual(
            translate('payment.payment_method_error', { message: 'payment error message' }),
        );
    });

    it('returns correct message when payment error payment_invalid', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    type: 'payment_invalid',
                },
                message: 'payment error message',
            },
            translate,
            false,
        );

        expect(message).toEqual(
            translate('payment.payment_method_error', { message: 'payment error message' }),
        );
    });

    it('returns correct message when payment error provider_error', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    type: 'provider_error',
                },
                message: 'payment error message',
            },
            translate,
            false,
        );

        expect(message).toEqual(
            translate('payment.payment_method_error', { message: 'payment error message' }),
        );
    });

    it('returns correct message when payment error provider_widget_error', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    type: 'provider_widget_error',
                },
                message: 'payment error message',
            },
            translate,
            false,
        );

        expect(message).toEqual(
            translate('payment.payment_method_error', { message: 'payment error message' }),
        );
    });

    it('returns correct message when payment error user_payment_error', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    type: 'user_payment_error',
                },
                message: 'payment error message',
            },
            translate,
            false,
        );

        expect(message).toEqual(
            translate('payment.payment_method_error', { message: 'payment error message' }),
        );
    });

    it('returns correct message when tax provider is unavailable', () => {
        const message = mapSubmitOrderErrorMessage(
            { type: 'tax_provider_unavailable' },
            translate,
            false,
        );

        expect(message).toEqual(translate('payment.tax_provider_unavailable'));
    });

    describe('When bigpay request error and localization enabled,', () => {
        it('returns correct translated message when one error is received', () => {
            const message = mapSubmitOrderErrorMessage(
                {
                    body: {
                        errors: [
                            {
                                code: 'incorrect_address',
                                message: 'whatever message coming from bigpay',
                            },
                        ],
                    },
                },
                translate,
                true,
            );

            expect(message).toEqual(translate('payment.errors.incorrect_address'));
        });

        it('returns correct translated messages when multiple errors are received', () => {
            const message = mapSubmitOrderErrorMessage(
                {
                    body: {
                        errors: [
                            {
                                code: 'incorrect_address',
                                message: 'whatever message coming from bigpay',
                            },
                            {
                                code: 'incorrect_amount',
                                message: 'whatever another message coming from bigpay',
                            },
                        ],
                    },
                },
                translate,
                true,
            );

            expect(message).toBe(
                `${translate('payment.errors.incorrect_address')} ${translate(
                    'payment.errors.incorrect_amount',
                )}`,
            );
        });

        it('returns untranslated error message when errors array is empty', () => {
            const message = mapSubmitOrderErrorMessage(
                {
                    body: {
                        errors: [],
                    },
                    message: 'bigpay error message',
                },
                translate,
                true,
            );

            expect(message).toBe('bigpay error message');
        });
    });

    it('returns untranslated error message when bigpay request error and localization disabled', () => {
        const message = mapSubmitOrderErrorMessage(
            {
                body: {
                    errors: [
                        {
                            code: 'incorrect_address',
                            message: 'whatever message coming from bigpay',
                        },
                        {
                            code: 'incorrect_amount',
                            message: 'whatever another message coming from bigpay',
                        },
                    ],
                },
                message: 'bigpay error message',
            },
            translate,
            false,
        );

        expect(message).toBe('bigpay error message');
    });

    describe('When not bigpay request error and no error message exists,', () => {
        it('returns correct default translated message when error type is "unrecoverable"', () => {
            const message = mapSubmitOrderErrorMessage(
                {
                    type: 'unrecoverable',
                },
                translate,
                false,
            );

            expect(message).toEqual(translate('common.unavailable_error'));
        });

        it('returns correct default translated message when error type is not "unrecoverable"', () => {
            const message = mapSubmitOrderErrorMessage(
                {
                    type: 'some_type',
                },
                translate,
                false,
            );

            expect(message).toEqual(translate('payment.place_order_error'));
        });

        it('returns correct translated message when payment_execute_error', () => {
            const error = {
                type: 'custom_provider_execute_error',
                subtype: 'payment.humm_not_processable_error',
            };
            const message = mapSubmitOrderErrorMessage(error, translate, false);

            expect(message).toEqual(translate('payment.humm_not_processable_error'));
        });
    });
});

describe('mapSubmitOrderErrorTitle()', () => {
    it('returns correct title when error type is "unrecoverable"', () => {
        const title = mapSubmitOrderErrorTitle(
            {
                type: 'unrecoverable',
            },
            translate,
        );

        expect(title).toEqual(translate('common.unavailable_heading'));
    });

    it('returns correct title when error type is not "unrecoverable"', () => {
        const title = mapSubmitOrderErrorTitle(
            {
                type: 'some_type',
            },
            translate,
        );

        expect(title).toEqual(translate('common.error_heading'));
    });
});
