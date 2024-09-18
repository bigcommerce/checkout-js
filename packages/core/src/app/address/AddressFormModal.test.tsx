import '@testing-library/jest-dom';
import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import AddressFormModal, { AddressFormModalProps } from './AddressFormModal';
import { getFormFields } from './formField.mock';


describe('AddressFormModal Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;

    const renderAddressFormModal = (props?: Partial<AddressFormModalProps>): void => {
        const defaultProps = {
            countriesWithAutocomplete: ['AU'],
            isLoading: false,
            isOpen: true,
            getFields: jest.fn(getFormFields),
            onSaveAddress: jest.fn(),
            countries: [],
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
        expect(screen.getByText('Address is required')).toBeInTheDocument();
        expect(screen.getByText('Address is required')).toBeInTheDocument();
    });

    it('successfully submits address form with required fields', async () => {
        const onSaveAddress = jest.fn();

        renderAddressFormModal({ onSaveAddress });

        await userEvent.click(screen.getByTestId('firstNameInput-text'));
        await userEvent.keyboard('John');
        await userEvent.click(screen.getByTestId('lastNameInput-text'));
        await userEvent.keyboard('Doe');
        await userEvent.click(screen.getByTestId('addressLine1Input-text'));
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
});
