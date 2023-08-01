import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { getCart, getCheckout, getCustomer, getPhysicalItem, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import { getCountries } from '../../geography/countries.mock';
import { OrderComments } from '../../orderComments';
import BillingSameAsShippingField from '../BillingSameAsShippingField';
import { getConsignment } from '../consignment.mock';
import { getShippingAddress } from '../shipping-addresses.mock';
import { ShippingOptions } from '../shippingOption';


import PayPalAxoMultiShippingForm from './PayPalAxoMultiShippingForm';
import PayPalAxoShippingAddress from './PayPalAxoShippingAddress';
import PayPalAxoShippingForm, { PayPalAxoShippingFormProps } from './PayPalAxoShippingForm';


describe('ShippingForm Component', () => {
    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let defaultProps: PayPalAxoShippingFormProps;

    const mountShippingForm = (shippingFormProps: PayPalAxoShippingFormProps) => {
        const localeContext = createLocaleContext(getStoreConfig());
        const checkoutService = createCheckoutService();
        const checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        return mount(
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <PayPalAxoShippingForm {...shippingFormProps} />
                    </LocaleContext.Provider>
                </ExtensionProvider>
            </CheckoutContext.Provider>
        );
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            isBillingSameAsShipping: true,
            cart: {
                ...getCart(),
                lineItems: {
                    physicalItems: [{ ...getPhysicalItem(), quantity: 3 }],
                    giftCertificates: [],
                    digitalItems: [],
                },
            },
            isGuest: false,
            onCreateAccount: jest.fn(),
            onSignIn: jest.fn(),
            assignItem: jest.fn(),
            addresses: getCustomer().addresses,
            cartHasChanged: false,
            countries: getCountries(),
            countriesWithAutocomplete: [],
            consignments: [
                { ...getConsignment(), id: 'foo' },
                { ...getConsignment(), id: 'bar' },
            ],
            customerMessage: 'comment',
            shippingAddress: getShippingAddress(),
            isMultiShippingMode: false,
            shouldShowOrderComments: true,
            onMultiShippingSubmit: jest.fn(),
            onSingleShippingSubmit: jest.fn(),
            isLoading: false,
            isShippingStepPending: false,
            deleteConsignments: jest.fn(),
            updateAddress: jest.fn(),
            onUseNewAddress: jest.fn(),
            getFields: jest.fn(() => []),
            onUnhandledError: jest.fn(),
            initialize: jest.fn(),
            deinitialize: jest.fn(),
            signOut: jest.fn(),
            shouldValidateSafeInput: true,
        };
    });

    describe('when multishipping mode is off', () => {
        beforeEach(() => {
            component = mountShippingForm(defaultProps);
        });

        it('renders ShippingAddress with expected props', () => {
            component = mountShippingForm({
                ...defaultProps,
                methodId: 'amazonpay',
            });

            expect(component.find(PayPalAxoShippingAddress).props()).toEqual(
                expect.objectContaining({
                    methodId: 'amazonpay',
                }),
            );
        });

        it('renders BillingSameAsShippping component', () => {
            expect(component.find(BillingSameAsShippingField)).toHaveLength(1);
        });

        it('renders disabled continue button when valid address and no shipping option', () => {
            component = mountShippingForm({
                ...defaultProps,
                consignments: [],
            });

            expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    disabled: true,
                }),
            );
        });

        it('renders enabled continue button when invalid address', () => {
            component = mountShippingForm({
                ...defaultProps,
                shippingAddress: {
                    ...getShippingAddress(),
                    address1: '',
                },
            });

            expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    disabled: false,
                }),
            );
        });

        it('renders enabled continue button when no address', () => {
            component = mountShippingForm({
                ...defaultProps,
                shippingAddress: undefined,
            });

            expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    disabled: false,
                }),
            );
        });

        it('renders ShippingAddress', () => {
            expect(component.find(PayPalAxoShippingAddress).props()).toEqual(
                expect.objectContaining({
                    methodId: undefined,
                    shippingAddress: defaultProps.shippingAddress,
                    addresses: defaultProps.addresses,
                    formFields: [],
                }),
            );

            expect(defaultProps.getFields).toHaveBeenCalledWith('US');
            expect(component.find(PayPalAxoMultiShippingForm)).toHaveLength(0);
        });

        it('renders shipping options', () => {
            expect(component.find(ShippingOptions).prop('isMultiShippingMode')).toBe(false);
        });

        it('renders order comments', () => {
            expect(component.find(OrderComments)).toHaveLength(1);
        });

        it('calls onSingleShippingSubmit when form is submitted', async () => {
            component.find('form').simulate('submit');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(defaultProps.onSingleShippingSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    billingSameAsShipping: true,
                    orderComment: 'comment',
                }),
            );
        });
    });

    describe('when multishipping mode is on', () => {
        describe('when user is guest', () => {
            beforeEach(() => {
                const checkoutService = createCheckoutService();

                component = mount(
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <PayPalAxoShippingForm {...defaultProps} isGuest={true} isMultiShippingMode={true} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>,
                );
            });

            it('doest not render shipping options', () => {
                expect(component.find(ShippingOptions)).toHaveLength(0);
            });

            it('does not render order comments', () => {
                expect(component.find(OrderComments)).toHaveLength(0);
            });

            it('renders MultiShippingForm', () => {
                expect(component.find(PayPalAxoShippingAddress)).toHaveLength(0);
                expect(component.find(PayPalAxoMultiShippingForm)).toHaveLength(1);
            });
        });

        describe('when user is signed in', () => {
            beforeEach(() => {
                component = mountShippingForm({
                    ...defaultProps,
                    isMultiShippingMode: true,
                });
            });

            it('renders disabled button when loading', () => {
                component = mountShippingForm({
                    ...defaultProps,
                    isLoading: true,
                    isMultiShippingMode: true,
                });

                expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                    expect.objectContaining({
                        isLoading: true,
                        disabled: true,
                    }),
                );
            });

            it('renders disabled button when no shipping option selected', () => {
                component = mountShippingForm({
                    ...defaultProps,
                    consignments: [
                        {
                            ...getConsignment(),
                            selectedShippingOption: undefined,
                        },
                    ],
                    isMultiShippingMode: true,
                });

                expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                    expect.objectContaining({
                        isLoading: false,
                        disabled: true,
                    }),
                );
            });

            it('renders disabled button when unassigned items', () => {
                component = mountShippingForm({
                    ...defaultProps,
                    consignments: [],
                    isMultiShippingMode: true,
                });

                expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                    expect.objectContaining({
                        isLoading: false,
                        disabled: true,
                    }),
                );
            });

            it('renders submit button', () => {
                expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                    expect.objectContaining({
                        isLoading: false,
                        disabled: false,
                    }),
                );
            });

            it('renders MultiShippingForm', () => {
                expect(component.find(PayPalAxoShippingAddress)).toHaveLength(0);
                expect(component.find(PayPalAxoMultiShippingForm)).toHaveLength(1);
            });

            it('renders shipping options', () => {
                expect(component.find(ShippingOptions).prop('isMultiShippingMode')).toBe(true);
            });

            it('renders order comments', () => {
                expect(component.find(OrderComments)).toHaveLength(1);
            });

            it('calls onMultiShippingSubmit when form is submitted', async () => {
                component.find('form').simulate('submit');

                await new Promise((resolve) => process.nextTick(resolve));

                expect(defaultProps.onMultiShippingSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        orderComment: 'comment',
                    }),
                );
            });
        });
    });
});
