import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../address/formField.mock';
import { getStoreConfig } from '../config/config.mock';

import { getShippingAddress } from './shipping-addresses.mock';
import SingleShippingForm, { SingleShippingFormProps } from './SingleShippingForm';

describe('SingleShippingForm', () => {
    const checkoutService = createCheckoutService();
    const addressFormFields = getAddressFormFields().filter(({ custom }) => !custom);

    const defaultProps: SingleShippingFormProps = {
        isMultiShippingMode: false,
        countries: [],
        countriesWithAutocomplete: [],
        shippingAddress: getShippingAddress(),
        customerMessage: '',
        addresses: [],
        shouldShowOrderComments: true,
        consignments: [],
        cartHasChanged: false,
        isBillingSameAsShipping: false,
        isLoading: false,
        isShippingStepPending: false,
        onSubmit: jest.fn(),
        getFields: jest.fn(() => addressFormFields),
        onUnhandledError: jest.fn(),
        deinitialize: jest.fn(),
        signOut: jest.fn(),
        initialize: jest.fn(),
        updateAddress: jest.fn(),
        deleteConsignments: jest.fn(),
    };

    const shippingAutosaveDelay = 100;
    const waitingDelay = shippingAutosaveDelay * 1.1;

    const renderSingleShippingFormComponent = (props?: Partial<SingleShippingFormProps>) => {
        const localeContext: LocaleContextType = createLocaleContext(getStoreConfig());

        render(
            <LocaleContext.Provider value={localeContext}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <SingleShippingForm
                        {...defaultProps}
                        {...props}
                        shippingAutosaveDelay={shippingAutosaveDelay}
                    />
                </ExtensionProvider>
            </LocaleContext.Provider>
        );
    };

    it('calls updateAddress with last event during a given timeframe', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({ updateAddress });

        await userEvent.clear(screen.getByTestId('addressLine1Input-text'));
        await userEvent.keyboard('foo 1');

        await userEvent.clear(screen.getByTestId('addressLine1Input-text'));
        await userEvent.keyboard('foo 2');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).toHaveBeenCalledTimes(1);
        expect(updateAddress).toHaveBeenCalledWith(
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
    });

    it('calls updateAddress if modified field does not affect shipping but makes form valid', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({
            updateAddress,
            getFields: () => [
                ...addressFormFields.map((field) => ({ ...field, required: true })),
            ],
        });

        await userEvent.clear(screen.getByTestId('addressLine2Input-text'));
        await userEvent.keyboard('foo 1');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).toHaveBeenCalledTimes(1);
        expect(updateAddress).toHaveBeenCalledWith(
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
    });

    it('calls updateAddress including shipping options if modified field does not affect shipping but has never requested shipping options', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({ updateAddress });

        await userEvent.clear(screen.getByTestId('addressLine2Input-text'));
        await userEvent.keyboard('foo 1');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).toHaveBeenCalledTimes(1);
        expect(updateAddress).toHaveBeenCalledWith(
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
    });

    it('calls updateAddress including shipping options if custom form fields are updated', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({
            updateAddress,
            getFields: () => [
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
            ],
        });

        await userEvent.clear(screen.getByTestId('field_25Input-text'));
        await userEvent.keyboard('foo');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).toHaveBeenCalledTimes(1);
        expect(updateAddress).toHaveBeenCalledWith(
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
    });

    it('calls updateAddress without shipping options if modified field does not affect shipping and shipping options have already been requested', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({ updateAddress });

        await userEvent.clear(screen.getByTestId('addressLine2Input-text'));
        await userEvent.keyboard('foo1');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        await userEvent.clear(screen.getByTestId('addressLine2Input-text'));
        await userEvent.keyboard('foo2');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).toHaveBeenCalledWith(
            {
                ...getShippingAddress(),
                address2: 'foo2',
            },
            {
                params: {
                    include: {
                        'consignments.availableShippingOptions': false,
                    },
                },
            },
        );
    });

    it('does not call updateAddress if modified field produces invalid address', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({ updateAddress });

        await userEvent.clear(screen.getByTestId('addressLine1Input-text'));

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).not.toHaveBeenCalled();
    });

    it('does not call updateAddress if same address', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({ updateAddress });

        const shippingCountry = defaultProps.shippingAddress?.country || '';
        const countryLastChar = shippingCountry.charAt(shippingCountry.length - 1);

        await userEvent.click(screen.getByTestId('countryInput-text'));
        await userEvent.keyboard(`{backspace}${countryLastChar}`);

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).not.toHaveBeenCalled();
    });

    it('calls update address for amazon pay if required custom fields are filled out', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({
            methodId: 'amazonpay',
            updateAddress,
            getFields: () => [
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
            ],
        });

        await userEvent.clear(screen.getByTestId('field_25-text'));
        await userEvent.keyboard('foo');

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).toHaveBeenCalledTimes(1);
        expect(updateAddress).toHaveBeenCalledWith(
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
    });

    it('does not update address for amazon pay if required custom fields is left empty', async () => {
        const updateAddress = jest.fn();

        renderSingleShippingFormComponent({
            methodId: 'amazonpay',
            updateAddress,
            getFields: () => [
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
            ],
        });

        await userEvent.clear(screen.getByTestId('field_25-text'));

        await new Promise((resolve) => setTimeout(resolve, waitingDelay));

        expect(updateAddress).not.toHaveBeenCalled();
    });

    it('does not render billing same as shipping checkbox for amazon pay', async () => {
        renderSingleShippingFormComponent({ methodId: 'amazonpay' });

        expect(screen.queryByTestId('billingSameAsShipping')).not.toBeInTheDocument();
    });
});
