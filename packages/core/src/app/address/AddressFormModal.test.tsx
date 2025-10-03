import '@testing-library/jest-dom';
import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import AddressFormModal, { type AddressFormModalProps } from './AddressFormModal';
import { getFormFields } from './formField.mock';

describe('AddressFormModal Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;

    const renderAddressFormModal = (props?: Partial<AddressFormModalProps>): void => {
        const defaultProps = {
            isLoading: false,
            isOpen: true,
            getFields: jest.fn(getFormFields),
            onSaveAddress: jest.fn(),
        };

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AddressFormModal {...defaultProps} {...props} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('shows modal to the customer', () => {
        const addressModalTitle = 'Add Address';

        renderAddressFormModal();

        expect(screen.getByText(addressModalTitle)).toBeInTheDocument();
    });

    it('does not show modal to the customer if it is not open', () => {
        const addressModalTitle = 'Add Address';

        renderAddressFormModal({
            isOpen: false,
        });

        expect(screen.queryByText(addressModalTitle)).not.toBeInTheDocument();
    });

    it('renders address form in the modal', () => {
        renderAddressFormModal();

        expect(screen.getByText('First Name')).toBeInTheDocument();
        expect(screen.getByText('Last Name')).toBeInTheDocument();
        expect(screen.getByText('Address')).toBeInTheDocument();
        expect(screen.getByText('Apartment/Suite/Building')).toBeInTheDocument();
        expect(screen.getByText('Custom message')).toBeInTheDocument();
        expect(screen.getByText('Custom dropdown')).toBeInTheDocument();
        expect(screen.getByText('Custom number')).toBeInTheDocument();
    });

    it('shows validation errors when address form required fields are empty', async () => {
        renderAddressFormModal();

        await userEvent.click(screen.getByText('Save Address'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(screen.getByText('First Name is required')).toBeInTheDocument();
        expect(screen.getByText('Last Name is required')).toBeInTheDocument();

        await userEvent.clear(screen.getByTestId('addressLine1Input-text'));
        await userEvent.click(screen.getByText('Save Address'));

        expect(await screen.findByText('Address is required')).toBeInTheDocument();
    });

    it('successfully submits address form with required fields', async () => {
        const onSaveAddress = jest.fn();

        renderAddressFormModal({ onSaveAddress });

        await userEvent.click(screen.getByTestId('firstNameInput-text'));
        await userEvent.keyboard('John');
        await userEvent.click(screen.getByTestId('lastNameInput-text'));
        await userEvent.keyboard('Doe');
        await userEvent.click(screen.getByTestId('addressLine1Input-text'));
        await userEvent.clear(screen.getByTestId('addressLine1Input-text'));
        await userEvent.keyboard('MockedAddress');
        await userEvent.click(screen.getByText('Save Address'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(screen.queryByText('First Name is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Name is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Address is required')).not.toBeInTheDocument();

        expect(onSaveAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                address1: 'MockedAddress',
            }),
        );
    });

    it('renders prefilled address form in the modal when selectedAddress is present', () => {
        const address = JSON.parse(JSON.stringify({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            address1: faker.address.streetAddress(),
        }));

        renderAddressFormModal({ selectedAddress: address });

        expect(screen.getByLabelText('First Name')).toHaveDisplayValue(address.firstName);
        expect(screen.getByLabelText('Last Name')).toHaveDisplayValue(address.lastName);
        expect(screen.getByLabelText('Address')).toHaveDisplayValue(address.address1);
        expect(screen.getByLabelText('Apartment/Suite/Building (Optional)')).toHaveDisplayValue('');
    });
});
