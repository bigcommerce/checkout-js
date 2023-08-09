import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getAddressFormFields } from '../../address/formField.mock';
import CheckoutStepType from '../../checkout/CheckoutStepType';
import { getStoreConfig } from '../../config/config.mock';
import BillingSameAsShippingField from '../BillingSameAsShippingField';
import { getShippingAddress } from '../shipping-addresses.mock';
import SingleShippingForm, {
    SHIPPING_AUTOSAVE_DELAY,
    SingleShippingFormProps,
} from '../SingleShippingForm';

describe('SingleShippingForm', () => {
    const checkoutService = createCheckoutService();
    const addressFormFields = getAddressFormFields().filter(({ custom }) => !custom);
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let defaultProps: SingleShippingFormProps;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            isMultiShippingMode: false,
            countries: [],
            countriesWithAutocomplete: [],
            shippingAddress: getShippingAddress(),
            customerMessage: '',
            addresses: [],
            shouldShowOrderComments: true,
            consignments: [],
            cartHasChanged: false,
            isLoading: false,
            step: { isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                type: CheckoutStepType.Shipping },
            isShippingMethodLoading: false,
            customerEmail: 'foo@test.com',
            isShippingStepPending: false,
            onSubmit: jest.fn(),
            getFields: jest.fn(() => addressFormFields),
            onUnhandledError: jest.fn(),
            deinitialize: jest.fn(),
            signOut: jest.fn(),
            initialize: jest.fn(),
            updateAddress: jest.fn(),
            deleteConsignments: jest.fn(),
            isStripeLoading: jest.fn(),
        };

        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <SingleShippingForm {...defaultProps} />
                </ExtensionProvider>
            </LocaleContext.Provider>,
        );
    });

    it('calls updateAddress with last event during a given timeframe', (done) => {
        component
            .find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address1' } });

        component
            .find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: 'foo 2', name: 'shippingAddress.address1' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).toHaveBeenCalledTimes(1);
            expect(defaultProps.updateAddress).toHaveBeenCalledWith(
                {
                    ...getShippingAddress(),
                    address1: 'foo 2',
                },
                {
                    params: {
                        include: {
                            'consignments.availableShippingOptions': true,
                        },
                    },
                },
            );

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('calls updateAddress if modified field does not affect shipping but makes form valid', (done) => {
        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <SingleShippingForm
                        {...defaultProps}
                        getFields={() => [
                            ...addressFormFields.map((field) => ({ ...field, required: true })),
                        ]}
                    />
                </ExtensionProvider>
            </LocaleContext.Provider>,
        );

        component
            .find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: '', name: 'shippingAddress.address2' } });

        component
            .find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address2' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).toHaveBeenCalledTimes(1);

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('calls updateAddress including shipping options if modified field does not affect shipping but has never requested shipping options', (done) => {
        component
            .find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address2' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).toHaveBeenCalledWith(
                {
                    ...getShippingAddress(),
                    address2: 'foo 1',
                },
                {
                    params: {
                        include: {
                            'consignments.availableShippingOptions': true,
                        },
                    },
                },
            );

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('calls updateAddress without shipping options if modified field does not affect shipping and shipping options have already been requested', (done) => {
        component
            .find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address2' } });

        setTimeout(() => {
            component.find('input[name="shippingAddress.address2"]').simulate('change', {
                target: { value: 'foo 2', name: 'shippingAddress.address2' },
            });

            setTimeout(() => {
                expect(defaultProps.updateAddress).toHaveBeenLastCalledWith(
                    {
                        ...getShippingAddress(),
                        address2: 'foo 2',
                    },
                    {
                        params: {
                            include: {
                                'consignments.availableShippingOptions': false,
                            },
                        },
                    },
                );

                done();
            }, SHIPPING_AUTOSAVE_DELAY * 1.1);
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if modified field produces invalid address', (done) => {
        component
            .find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: '', name: 'shippingAddress.address1' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if not valid address', (done) => {
        component
            .find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: '', name: 'shippingAddress.address1' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if same address', (done) => {
        component
            .find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: '', name: getShippingAddress().address1 } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('calls update address for amazon pay if required custom fields are filled out', (done) => {
        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <SingleShippingForm
                        {...defaultProps}
                        getFields={() => [
                            ...addressFormFields,
                            {
                                custom: true,
                                default: '',
                                fieldType: 'text',
                                id: 'field_25',
                                label: 'Custom message',
                                name: 'field_25',
                                required: true,
                                type: 'string',
                            },
                        ]}
                    />
                </ExtensionProvider>
            </LocaleContext.Provider>,
        );

        component.find('input[name="shippingAddress.customFields.field_25"]').simulate('change', {
            target: { value: 'foo', name: 'shippingAddress.customFields.field_25' },
        });

        setTimeout(() => {
            expect(defaultProps.updateAddress).toHaveBeenCalledWith(
                {
                    ...getShippingAddress(),
                    customFields: [
                        {
                            fieldId: 'field_25',
                            fieldValue: 'foo',
                        },
                    ],
                },
                {
                    params: {
                        include: {
                            'consignments.availableShippingOptions': true,
                        },
                    },
                },
            );

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not update address for amazon pay if required custom fields is left empty', (done) => {
        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <SingleShippingForm
                        {...defaultProps}
                        getFields={() => [
                            ...addressFormFields,
                            {
                                custom: true,
                                default: '',
                                fieldType: 'text',
                                id: 'field_25',
                                label: 'Custom message',
                                name: 'field_25',
                                required: true,
                                type: 'string',
                            },
                        ]}
                    />
                </ExtensionProvider>
            </LocaleContext.Provider>,
        );

        component.find('input[name="shippingAddress.customFields.field_25"]').simulate('change', {
            target: { value: '', name: 'shippingAddress.customFields.field_25' },
        });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();

            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not render billing same as shipping checkbox for amazon pay', () => {
        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <SingleShippingForm {...defaultProps} methodId="amazonpay" />
                </ExtensionProvider>
            </LocaleContext.Provider>,
        );

        expect(component.contains(<BillingSameAsShippingField />)).toBe(false);
    });
});
