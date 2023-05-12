import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { getInstruments } from '../storedInstrument/instruments.mock';

import StoreInstrumentFieldset from './';

describe('StoreInstrumentFieldset', () => {
    let StoreInstrumentFieldsetTest: typeof StoreInstrumentFieldset;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

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
                const container = mount(<StoreInstrumentFieldsetTest />);

                expect(container.text()).toMatch(/save/i);
                expect(container.text()).toMatch(/card/i);
                expect(container.text()).not.toMatch(/account/i);

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
            });

            it('does not show the "make default" input', () => {
                const container = mount(<StoreInstrumentFieldsetTest />);

                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    false,
                );
            });
        });

        describe('when using a new account instrument', () => {
            it('shows the "save account instrument" input', () => {
                const container = mount(<StoreInstrumentFieldsetTest isAccountInstrument={true} />);

                expect(container.text()).toMatch(/save/i);
                expect(container.text()).toMatch(/account/i);
                expect(container.text()).not.toMatch(/card/i);

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
            });

            it('does not show the "make default" input', () => {
                const container = mount(<StoreInstrumentFieldsetTest isAccountInstrument={true} />);

                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    false,
                );
            });
        });
    });

    describe('when there are some previously stored instruments', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());
        });

        describe('when using a new card', () => {
            it('shows the both the "save card" and "make default" inputs', () => {
                const container = mount(<StoreInstrumentFieldsetTest />);

                expect(container.text()).toMatch(/save/i);
                expect(container.text()).toMatch(/default/i);
                expect(container.text()).toMatch(/card/i);
                expect(container.text()).not.toMatch(/account/i);

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    true,
                );
            });
        });

        describe('when using a new account instrument', () => {
            it('shows the both the "save account instrument" and "make default" inputs', () => {
                const container = mount(<StoreInstrumentFieldsetTest isAccountInstrument={true} />);

                expect(container.text()).toMatch(/save/i);
                expect(container.text()).toMatch(/default/i);
                expect(container.text()).toMatch(/account/i);
                expect(container.text()).not.toMatch(/card/i);

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
            });
        });

        describe('when using a previously stored, default card', () => {
            it('does not show either the "save card" or "make default" inputs', () => {
                const container = mount(
                    <StoreInstrumentFieldsetTest instrumentId={getInstruments()[0].bigpayToken} />,
                );

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(false);
                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    false,
                );
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

                const container = mount(
                    <StoreInstrumentFieldsetTest instrumentId="4123" isAccountInstrument={true} />,
                );

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(false);
                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    false,
                );
            });
        });

        describe('when using a previously stored, but not default card', () => {
            it('does not show the "save card" input', () => {
                const container = mount(
                    <StoreInstrumentFieldsetTest instrumentId={getInstruments()[1].bigpayToken} />,
                );

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(false);
            });

            it('shows the "make default" input', () => {
                const container = mount(
                    <StoreInstrumentFieldsetTest instrumentId={getInstruments()[1].bigpayToken} />,
                );

                expect(container.text()).toMatch(/default/i);
                expect(container.text()).toMatch(/card/i);
                expect(container.text()).not.toMatch(/account/i);

                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    true,
                );
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
                const container = mount(
                    <StoreInstrumentFieldsetTest instrumentId="4123" isAccountInstrument={true} />,
                );

                expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(false);
            });

            it('shows the "make default" input', () => {
                const container = mount(
                    <StoreInstrumentFieldsetTest instrumentId="4123" isAccountInstrument={true} />,
                );

                expect(container.text()).toMatch(/default/i);
                expect(container.text()).toMatch(/account/i);
                expect(container.text()).not.toMatch(/card/i);

                expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists()).toBe(
                    true,
                );
            });
        });
    });
});
