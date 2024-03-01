import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { CheckoutService, createCheckoutService, CustomerAddress } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getShippingAddress } from '@bigcommerce/checkout/test-mocks';

import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';
import { OrderComments } from '../orderComments';
import { PaymentMethodId } from '../payment/paymentMethod';

import BillingSameAsShippingField from './BillingSameAsShippingField';
import { getConsignment } from './consignment.mock';
import MultiShippingForm from './MultiShippingForm';
import ShippingAddress from './ShippingAddress';
import ShippingForm, { ShippingFormProps } from './ShippingForm';
import { ShippingOptions } from './shippingOption';
import SingleShippingForm from './SingleShippingForm';

jest.mock('@bigcommerce/checkout/paypal-fastlane-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/paypal-fastlane-integration'),
    usePayPalFastlaneAddress: jest.fn(() => ({
        isPayPalFastlaneEnabled: false,
        mergedBcAndPayPalFastlaneAddresses: []
    })),
}));

describe('ShippingForm Component', () => {
    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let defaultProps: ShippingFormProps;
    let checkoutService: CheckoutService;

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

        checkoutService = createCheckoutService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('when multishipping mode is off', () => {
        beforeEach(() => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...defaultProps} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );
        });

        it('renders ShippingAddress with expected props', () => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...defaultProps} methodId="amazonpay" />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find(ShippingAddress).props()).toEqual(
                expect.objectContaining({
                    methodId: 'amazonpay',
                }),
            );
        });

        it('renders BillingSameAsShippping component', () => {
            expect(component.find(BillingSameAsShippingField)).toHaveLength(1);
        });

        it('renders disabled continue button when valid address and no shipping option', () => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...defaultProps} consignments={[]} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    disabled: true,
                }),
            );
        });

        it('renders enabled continue button when invalid address', () => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm
                                {...defaultProps}
                                shippingAddress={{
                                    ...getShippingAddress(),
                                    address1: '',
                                }}
                            />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    disabled: false,
                }),
            );
        });

        it('renders enabled continue button when no address', () => {
            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...defaultProps} shippingAddress={undefined} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    disabled: false,
                }),
            );
        });

        it('renders ShippingAddress', () => {
            expect(component.find(ShippingAddress).props()).toEqual(
                expect.objectContaining({
                    methodId: undefined,
                    shippingAddress: defaultProps.shippingAddress,
                    addresses: defaultProps.addresses,
                    formFields: [],
                }),
            );

            expect(defaultProps.getFields).toHaveBeenCalledWith('US');
            expect(component.find(MultiShippingForm)).toHaveLength(0);
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
                component = mount(
                    <CheckoutProvider checkoutService={checkoutService}>
                        <LocaleContext.Provider value={localeContext}>
                            <ExtensionProvider checkoutService={checkoutService}>
                                <ShippingForm {...defaultProps} isGuest={true} isMultiShippingMode={true} />
                            </ExtensionProvider>
                        </LocaleContext.Provider>
                    </CheckoutProvider>,
                );
            });

            it('doest not render shipping options', () => {
                expect(component.find(ShippingOptions)).toHaveLength(0);
            });

            it('does not render order comments', () => {
                expect(component.find(OrderComments)).toHaveLength(0);
            });

            it('renders MultiShippingForm', () => {
                expect(component.find(ShippingAddress)).toHaveLength(0);
                expect(component.find(MultiShippingForm)).toHaveLength(1);
            });
        });

        describe('when user is signed in', () => {
            beforeEach(() => {
                component = mount(
                    <CheckoutProvider checkoutService={checkoutService}>
                        <LocaleContext.Provider value={localeContext}>
                            <ExtensionProvider checkoutService={checkoutService}>
                                <ShippingForm {...defaultProps} isMultiShippingMode={true} />
                            </ExtensionProvider>
                        </LocaleContext.Provider>
                    </CheckoutProvider>,
                );
            });

            it('renders disabled button when loading', () => {
                component = mount(
                    <CheckoutProvider checkoutService={checkoutService}>
                        <LocaleContext.Provider value={localeContext}>
                            <ExtensionProvider checkoutService={checkoutService}>
                                <ShippingForm
                                    {...defaultProps}
                                    isLoading={true}
                                    isMultiShippingMode={true}
                                />
                            </ExtensionProvider>
                        </LocaleContext.Provider>
                    </CheckoutProvider>,
                );

                expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                    expect.objectContaining({
                        isLoading: true,
                        disabled: true,
                    }),
                );
            });

            it('renders disabled button when no shipping option selected', () => {
                component = mount(
                    <CheckoutProvider checkoutService={checkoutService}>
                        <LocaleContext.Provider value={localeContext}>
                            <ExtensionProvider checkoutService={checkoutService}>
                                <ShippingForm
                                    {...defaultProps}
                                    consignments={[
                                        {
                                            ...getConsignment(),
                                            selectedShippingOption: undefined,
                                        },
                                    ]}
                                    isMultiShippingMode={true}
                                />
                            </ExtensionProvider>
                        </LocaleContext.Provider>
                    </CheckoutProvider>,
                );

                expect(component.find('Button#checkout-shipping-continue').props()).toEqual(
                    expect.objectContaining({
                        isLoading: false,
                        disabled: true,
                    }),
                );
            });

            it('renders disabled button when unassigned items', () => {
                component = mount(
                    <CheckoutProvider checkoutService={checkoutService}>
                        <LocaleContext.Provider value={localeContext}>
                            <ExtensionProvider checkoutService={checkoutService}>
                                <ShippingForm
                                    {...defaultProps}
                                    consignments={[]}
                                    isMultiShippingMode={true}
                                />
                            </ExtensionProvider>
                        </LocaleContext.Provider>
                    </CheckoutProvider>,
                );

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
                expect(component.find(ShippingAddress)).toHaveLength(0);
                expect(component.find(MultiShippingForm)).toHaveLength(1);
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

    describe('Braintree Fastlane', () => {
        it('renders SingleShippingForm with default addresses list if PayPal Fastlane disabled', () => {
            const initializeMock = jest.fn();
            const ShippingFormProps = {
                ...defaultProps,
                initialize: initializeMock,
            };

            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...ShippingFormProps} methodId={PaymentMethodId.BraintreeAcceleratedCheckout} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find(SingleShippingForm).props()).toEqual(
                expect.objectContaining({
                    addresses: defaultProps.addresses,
                }),
            );
            expect(initializeMock).not.toHaveBeenCalled();
        });

        it('renders SingleShippingForm with merged addresses list if PayPal Fastlane enabled', () => {
            const initializeMock = jest.fn();
            const shippingFormProps = {
                ...defaultProps,
                initialize: initializeMock,
            };
            const paypalFastlaneAddresses: CustomerAddress[] = [
                {
                    ...getShippingAddress(),
                    id: 123,
                    type: 'paypal-address',
                }
            ];

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
                isPayPalFastlaneEnabled: true,
                paypalFastlaneAddresses,
                mergedBcAndPayPalFastlaneAddresses: paypalFastlaneAddresses,
            });

            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...shippingFormProps} methodId={PaymentMethodId.BraintreeAcceleratedCheckout} />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find(SingleShippingForm).props()).toEqual(
                expect.objectContaining({
                    addresses: paypalFastlaneAddresses,
                }),
            );
            expect(initializeMock).toHaveBeenCalledWith({
                methodId: PaymentMethodId.BraintreeAcceleratedCheckout,
            });
        });

        it('renders shipping for with paypal fastlane addresses without strategy initialization if there is preselected shipping method id', () => {
            const initializeMock = jest.fn();
            const shippingFormProps = {
                ...defaultProps,
                initialize: initializeMock,
            };
            const paypalFastlaneAddresses: CustomerAddress[] = [
                {
                    ...getShippingAddress(),
                    id: 123,
                    type: 'paypal-address',
                }
            ];

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
                isPayPalFastlaneEnabled: true,
                paypalFastlaneAddresses,
                mergedBcAndPayPalFastlaneAddresses: paypalFastlaneAddresses,
            });

            component = mount(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <ShippingForm {...shippingFormProps} methodId="notPPFastlaneMethodID" />
                        </ExtensionProvider>
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(component.find(SingleShippingForm).props()).toEqual(
                expect.objectContaining({
                    addresses: paypalFastlaneAddresses,
                }),
            );
            expect(initializeMock).not.toHaveBeenCalled();
        });
    });
});
