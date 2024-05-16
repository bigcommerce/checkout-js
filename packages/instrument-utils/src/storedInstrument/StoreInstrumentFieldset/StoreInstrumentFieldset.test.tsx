import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React from 'react';
import '@testing-library/jest-dom';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import StoreInstrumentFieldset from './StoreInstrumentFieldset';

describe('StoreInstrumentFieldset', () => {
    let StoreInstrumentFieldsetTest: typeof StoreInstrumentFieldset;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(
            merge({}, getPaymentMethod(), {
                config: {
                    isVaultingEnabled: true,
                },
            }),
        );

        StoreInstrumentFieldsetTest = (props) => (
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <StoreInstrumentFieldset {...props} />
                        </Formik>
                    </CheckoutContext.Provider>
                </PaymentFormContext.Provider>
            </LocaleContext.Provider>
        );
    });

    describe('when there are no previously stored instruments', () => {
        describe('when using a new card', () => {
            it('shows the "save card" input', () => {
                render(<StoreInstrumentFieldsetTest instruments={[]} />);

                expect(
                    screen.getByText('Save this card for future transactions'),
                ).toBeInTheDocument();
            });

            it('does not show the "make default" input', () => {
                render(<StoreInstrumentFieldsetTest instruments={[]} />);
                expect(
                    screen.queryByText(
                        'Use this card as the default payment method for future transactions',
                    ),
                ).not.toBeInTheDocument();
            });
        });

        describe('when using a new account instrument', () => {
            it('shows the "save account instrument" input', () => {
                render(<StoreInstrumentFieldsetTest instruments={[]} isAccountInstrument={true} />);

                expect(
                    screen.getByText('Save this account for future transactions'),
                ).toBeInTheDocument();
            });

            it('does not show the "make default" input', () => {
                render(<StoreInstrumentFieldsetTest instruments={[]} />);
                expect(
                    screen.queryByText(
                        'Use this account as the default payment method for future transactions',
                    ),
                ).not.toBeInTheDocument();
            });
        });
    });

    describe('when there are some previously stored instruments', () => {
        describe('when using a new card', () => {
            it('shows the both the "save card" and "make default" inputs', () => {
                render(<StoreInstrumentFieldsetTest instruments={getInstruments()} />);

                expect(
                    screen.getByText('Save this card for future transactions'),
                ).toBeInTheDocument();
                expect(
                    screen.getByText(
                        'Use this card as the default payment method for future transactions',
                    ),
                ).toBeInTheDocument();
            });
        });

        describe('when using a new account instrument', () => {
            it('shows the both the "save account instrument" and "make default" inputs', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instruments={getInstruments()}
                        isAccountInstrument={true}
                    />,
                );

                expect(
                    screen.getByText('Save this account for future transactions'),
                ).toBeInTheDocument();
                expect(
                    screen.getByText(
                        'Use this account as the default payment method for future transactions',
                    ),
                ).toBeInTheDocument();
            });
        });

        describe('when using a previously stored, default card', () => {
            it('does not show either the "save card" or "make default" inputs', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instrumentId={getInstruments()[0].bigpayToken}
                        instruments={getInstruments()}
                    />,
                );

                expect(
                    screen.queryByText('Save this card for future transactions'),
                ).not.toBeInTheDocument();
                expect(
                    screen.queryByText(
                        'Use this card as the default payment method for future transactions',
                    ),
                ).not.toBeInTheDocument();
            });
        });

        describe('when using a previously stored, default account instrument', () => {
            it('does not show either the "save account instrument" or "make default" inputs', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instrumentId="4123"
                        instruments={[
                            {
                                bigpayToken: '4123',
                                provider: 'authorizenet',
                                externalId: 'test@external-id-2.com',
                                trustedShippingAddress: false,
                                defaultInstrument: true,
                                method: 'paypal',
                                type: 'account',
                            },
                        ]}
                        isAccountInstrument={true}
                    />,
                );

                expect(
                    screen.queryByText('Save this account for future transactions'),
                ).not.toBeInTheDocument();
                expect(
                    screen.queryByText(
                        'Use this account as the default payment method for future transactions',
                    ),
                ).not.toBeInTheDocument();
            });
        });

        describe('when using a previously stored, but not default card', () => {
            it('does not show the "save card" input', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instrumentId={getInstruments()[1].bigpayToken}
                        instruments={getInstruments()}
                    />,
                );

                expect(
                    screen.queryByText('Save this card for future transactions'),
                ).not.toBeInTheDocument();
            });

            it('shows the "make default" input', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instrumentId={getInstruments()[1].bigpayToken}
                        instruments={getInstruments()}
                    />,
                );

                expect(
                    screen.getByText(
                        'Use this card as the default payment method for future transactions',
                    ),
                ).toBeInTheDocument();
            });
        });

        describe('when using a previously stored, but not default account instrument', () => {
            it('does not show the "save account instrument" input', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instrumentId="4123"
                        instruments={[
                            {
                                bigpayToken: '4123',
                                provider: 'authorizenet',
                                externalId: 'test@external-id-2.com',
                                trustedShippingAddress: false,
                                defaultInstrument: false,
                                method: 'paypal',
                                type: 'account',
                            },
                        ]}
                        isAccountInstrument={true}
                    />,
                );

                expect(
                    screen.queryByText('Save this account for future transactions'),
                ).not.toBeInTheDocument();
            });

            it('shows the "make default" input', () => {
                render(
                    <StoreInstrumentFieldsetTest
                        instrumentId="4123"
                        instruments={[
                            {
                                bigpayToken: '4123',
                                provider: 'authorizenet',
                                externalId: 'test@external-id-2.com',
                                trustedShippingAddress: false,
                                defaultInstrument: false,
                                method: 'paypal',
                                type: 'account',
                            },
                        ]}
                        isAccountInstrument={true}
                    />,
                );

                expect(
                    screen.getByText(
                        'Use this account as the default payment method for future transactions',
                    ),
                ).toBeInTheDocument();
            });
        });
    });
});
