import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { getInstruments } from '../storedInstrument/instruments.mock';

import StoreInstrumentFieldset from './';

describe('StoreInstrumentFieldset', () => {
    let StoreInstrumentFieldsetTest: typeof StoreInstrumentFieldset;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let translate: (key: string) => string;

    beforeEach(() => {
        const localContext = createLocaleContext(getStoreConfig());

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        translate = localContext.language.translate;

        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(
            merge({}, getPaymentMethod(), {
                config: {
                    isVaultingEnabled: true,
                },
            }),
        );

        StoreInstrumentFieldsetTest = (props) => (
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <StoreInstrumentFieldset {...props} />
                    </Formik>
                </CheckoutProvider>
            </LocaleContext.Provider>
        );
    });

    describe('when there are no previously stored instruments', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);
        });

        describe('when using a new card', () => {
            it('shows the "save card" input', () => {
                render(<StoreInstrumentFieldsetTest />);

                expect(screen.getByRole('checkbox',{
                    name: translate('payment.instrument_save_payment_method_label') },
                )).toBeInTheDocument();
            });

            it('does not show the "make default" input', () => {
                render(<StoreInstrumentFieldsetTest />);

                expect(screen.queryByRole('checkbox',{
                    name: translate('payment.instrument_save_as_default_payment_method_label') },
                )).not.toBeInTheDocument();
            });
        });

        describe('when using a new account instrument', () => {
            it('shows the "save account instrument" input', () => {
                render(<StoreInstrumentFieldsetTest isAccountInstrument={true} />);

                expect(screen.getByText(
                    translate('payment.account_instrument_save_payment_method_label'),
                )).toBeInTheDocument();
            });

            it('does not show the "make default" input', () => {
                render(<StoreInstrumentFieldsetTest isAccountInstrument={true} />);

                expect(screen.queryByRole('checkbox', {
                    name: /default/i,
                })).not.toBeInTheDocument();
            });
        });
    });

    describe('when there are some previously stored instruments', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());
        });

        describe('when using a new card', () => {
            it('shows the both the "save card" and "make default" inputs', () => {
                render(<StoreInstrumentFieldsetTest />);

                expect(screen.getByRole('checkbox',{
                    name: translate('payment.instrument_save_payment_method_label'),
                })).toBeInTheDocument();
                expect(screen.getByRole('checkbox',{
                    name: translate('payment.instrument_save_as_default_payment_method_label'),
                })).toBeInTheDocument();
            });
        });

        describe('when using a new account instrument', () => {
            it('shows the both the "save account instrument" and "make default" inputs', () => {
                render(<StoreInstrumentFieldsetTest isAccountInstrument={true} />);

                expect(screen.getByRole('checkbox', {
                    name: translate('payment.account_instrument_save_payment_method_label'),
                })).toBeInTheDocument();
                expect(screen.getByRole('checkbox',{
                    name: translate('payment.account_instrument_save_as_default_payment_method_label'),
                })).toBeInTheDocument();
            });
        });

        describe('when using a previously stored, default card', () => {
            it('does not show either the "save card" or "make default" inputs', () => {
                render(
                    <StoreInstrumentFieldsetTest instrumentId={getInstruments()[0].bigpayToken} />,
                );

                expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
            });
        });

        describe('when using a previously stored, default account instrument', () => {
            it('does not show either the "save account instrument" or "make default" inputs', () => {
                jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([
                    {
                        bigpayToken: '4123',
                        provider: 'authorizenet',
                        externalId: 'test@external-id-2.com',
                        trustedShippingAddress: false,
                        defaultInstrument: true,
                        method: 'paypal',
                        type: 'account',
                    },
                ]);

                render(
                    <StoreInstrumentFieldsetTest instrumentId="4123" isAccountInstrument={true} />,
                );

                expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
            });
        });

        describe('when using a previously stored, but not default card', () => {
            it('does not show the "save card" input', () => {
                render(
                    <StoreInstrumentFieldsetTest instrumentId={getInstruments()[1].bigpayToken} />,
                );

                expect(screen.queryByText(
                    translate('payment.instrument_save_payment_method_label'),
                )).not.toBeInTheDocument();
            });

            it('shows the "make default" input', () => {
                render(
                    <StoreInstrumentFieldsetTest instrumentId={getInstruments()[1].bigpayToken} />,
                );

                expect(screen.getByRole('checkbox',{
                    name: translate('payment.instrument_save_as_default_payment_method_label'),
                })).toBeInTheDocument();
            });
        });

        describe('when using a previously stored, but not default account instrument', () => {
            beforeEach(() => {
                jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([
                    {
                        bigpayToken: '4123',
                        provider: 'authorizenet',
                        externalId: 'test@external-id-2.com',
                        trustedShippingAddress: false,
                        defaultInstrument: false,
                        method: 'paypal',
                        type: 'account',
                    },
                ]);
            });

            it('does not show the "save account instrument" input', () => {
                render(
                    <StoreInstrumentFieldsetTest instrumentId="4123" isAccountInstrument={true} />,
                );

                expect(screen.queryByText(
                    translate('payment.instrument_save_as_default_payment_method_label'),
                )).not.toBeInTheDocument();
            });

            it('shows the "make default" input', () => {
                render(
                    <StoreInstrumentFieldsetTest instrumentId="4123" isAccountInstrument={true} />,
                );

                expect(screen.getByRole('checkbox',{
                    name: translate('payment.account_instrument_save_as_default_payment_method_label'),
                })).toBeInTheDocument();
            });
        });
    });
});
