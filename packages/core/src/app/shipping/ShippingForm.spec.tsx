import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { OrderComments } from '../orderComments';

import BillingSameAsShippingField from './BillingSameAsShippingField';
import { getConsignment } from './consignment.mock';
import MultiShippingForm from './MultiShippingForm';
import { getShippingAddress } from './shipping-addresses.mock';
import ShippingAddress from './ShippingAddress';
import ShippingForm, { ShippingFormProps } from './ShippingForm';
import { ShippingOptions } from './shippingOption';

describe('ShippingForm Component', () => {
    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let defaultProps: ShippingFormProps;

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
            component = mount(
                <LocaleContext.Provider value={localeContext}>
                    <ShippingForm {...defaultProps} />
                </LocaleContext.Provider>,
            );
        });

        it('renders ShippingAddress with expected props', () => {
            component = mount(
                <LocaleContext.Provider value={localeContext}>
                    <ShippingForm {...defaultProps} methodId="amazonpay" />
                </LocaleContext.Provider>,
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
                <LocaleContext.Provider value={localeContext}>
                    <ShippingForm {...defaultProps} consignments={[]} />
                </LocaleContext.Provider>,
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
                <LocaleContext.Provider value={localeContext}>
                    <ShippingForm
                        {...defaultProps}
                        shippingAddress={{
                            ...getShippingAddress(),
                            address1: '',
                        }}
                    />
                </LocaleContext.Provider>,
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
                <LocaleContext.Provider value={localeContext}>
                    <ShippingForm {...defaultProps} shippingAddress={undefined} />
                </LocaleContext.Provider>,
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
                    <LocaleContext.Provider value={localeContext}>
                        <ShippingForm {...defaultProps} isGuest={true} isMultiShippingMode={true} />
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
                expect(component.find(ShippingAddress)).toHaveLength(0);
                expect(component.find(MultiShippingForm)).toHaveLength(1);
            });
        });

        describe('when user is signed in', () => {
            beforeEach(() => {
                component = mount(
                    <LocaleContext.Provider value={localeContext}>
                        <ShippingForm {...defaultProps} isMultiShippingMode={true} />
                    </LocaleContext.Provider>,
                );
            });

            it('renders disabled button when loading', () => {
                component = mount(
                    <LocaleContext.Provider value={localeContext}>
                        <ShippingForm
                            {...defaultProps}
                            isLoading={true}
                            isMultiShippingMode={true}
                        />
                    </LocaleContext.Provider>,
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
                    <LocaleContext.Provider value={localeContext}>
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
                    </LocaleContext.Provider>,
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
                    <LocaleContext.Provider value={localeContext}>
                        <ShippingForm
                            {...defaultProps}
                            consignments={[]}
                            isMultiShippingMode={true}
                        />
                    </LocaleContext.Provider>,
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
});
