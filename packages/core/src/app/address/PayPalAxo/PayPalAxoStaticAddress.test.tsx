import { Address, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getAddress } from '@bigcommerce/checkout/test-utils';

import * as isValidAddress from '../../address/isValidAddress';
import * as localizeAddress from '../../address/localizeAddress';
import { getAddressFormFields } from '../formField.mock';

import PayPalAxoStaticAddress, { PayPalAxoStaticAddressEditableProps, WithCheckoutStaticAddressProps } from './PayPalAxoStaticAddress';
import * as usePayPalConnectAddress from './usePayPalConnectAddress';

jest.mock('@bigcommerce/checkout/ui', () => ({
    IconPayPalConnectSmall: () => <div>IconPayPalConnectSmall</div>,
}));

describe('PayPalAxoStaticAddress', () => {
    const defaultProps = {
        address: getAddress(),
        fields: getAddressFormFields(),
    };

    const renderComponent = (props: PayPalAxoStaticAddressEditableProps & WithCheckoutStaticAddressProps) => {
        const checkoutService = createCheckoutService();

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <PayPalAxoStaticAddress {...props} />
            </CheckoutProvider>
        );
    };

    beforeEach(() => {
        jest.spyOn(isValidAddress, 'default').mockReturnValue(true);
        jest.spyOn(localizeAddress, 'default').mockImplementation(
            (address: Address) => ({
                ...address,
                localizedCountry: address.country,
                localizedProvince: address.country,
            })
        );
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: jest.fn().mockReturnValue(false),
            }))
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('does not render with no form fields end empty address', () => {
        renderComponent({
            address: {} as Address,
        });

        expect(screen.queryByText('12345 Testing Way')).not.toBeInTheDocument();
        expect(screen.queryByText('Some City,')).not.toBeInTheDocument();
        expect(screen.queryByText('95555 /')).not.toBeInTheDocument();
    });

    it('renders with no form fields end existing address', () => {
        renderComponent({
            ...defaultProps,
            fields: undefined,
        });

        expect(screen.getByText('12345 Testing Way')).toBeInTheDocument();
        expect(screen.getByText('Some City,')).toBeInTheDocument();
        expect(screen.getByText('95555 /')).toBeInTheDocument();
    });

    it('does not render with invalid address', () => {
        jest.spyOn(isValidAddress, 'default').mockReturnValue(false);
        renderComponent(defaultProps);

        expect(screen.queryByText('12345 Testing Way')).not.toBeInTheDocument();
        expect(screen.queryByText('Some City,')).not.toBeInTheDocument();
        expect(screen.queryByText('95555 /')).not.toBeInTheDocument();
    });

    it('renders with valid address', () => {
        renderComponent(defaultProps);

        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('Tester')).toBeInTheDocument();
        expect(screen.getByText('Bigcommerce')).toBeInTheDocument();
        expect(screen.getByText('555-555-5555')).toBeInTheDocument();
        expect(screen.getByText('12345 Testing Way')).toBeInTheDocument();
        expect(screen.getByText('Some City,')).toBeInTheDocument();
        expect(screen.getByText('95555 /')).toBeInTheDocument();
    });

    it('renders PayPal Connect address with icon', () => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: jest.fn().mockReturnValue(true),
            }))
        );

        renderComponent(defaultProps);

        expect(screen.getByText('IconPayPalConnectSmall')).toBeInTheDocument();
    });
});
