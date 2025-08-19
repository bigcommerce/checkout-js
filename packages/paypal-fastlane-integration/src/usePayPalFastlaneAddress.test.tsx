import { type Address } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import * as PaymentIntegrationApi from '@bigcommerce/checkout/payment-integration-api';
import { getAddress, getCustomer, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import isPayPalFastlaneAddress from './is-paypal-fastlane-address';
import usePayPalFastlaneAddress from './usePayPalFastlaneAddress';

interface PayPalFastlaneAddressComponentProps {
    selectedAddress: Address;
}

const PayPalFastlaneAddressComponentMock = ({
    selectedAddress,
}: PayPalFastlaneAddressComponentProps) => {
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses, shouldShowPayPalFastlaneLabel } =
        usePayPalFastlaneAddress();

    return (
        <>
            <div data-test="isPayPalFastlaneEnabled">
                {isPayPalFastlaneEnabled ? 'true' : 'false'}
            </div>
            <div data-test="isPayPalFastlaneAddress">
                {isPayPalFastlaneAddress(selectedAddress, paypalFastlaneAddresses)
                    ? 'true'
                    : 'false'}
            </div>
            <div data-test="shouldShowPayPalFastlaneLabel">
                {shouldShowPayPalFastlaneLabel ? 'true' : 'false'}
            </div>
            <ul>
                {paypalFastlaneAddresses.map((address, index) => (
                    <li key={index}>{address.address1}</li>
                ))}
            </ul>
        </>
    );
};

describe('usePayPalFastlaneAddress', () => {
    const defaultStoreConfig = getStoreConfig();
    const defaultCustomer = getCustomer();

    const defaultAddress = getAddress();
    const paypalAddress1 = {
        ...defaultAddress,
        id: 2,
        type: 'paypal-address',
        address1: 'address-PP1',
    };
    const paypalAddress2 = {
        ...defaultAddress,
        id: 4,
        type: 'paypal-address',
        address1: 'address-PP2',
    };

    beforeEach(() => {
        jest.spyOn(PaymentIntegrationApi, 'useCheckout').mockImplementation(
            jest.fn().mockImplementation(() => ({
                checkoutState: {
                    data: {
                        getPaymentProviderCustomer: () => ({
                            addresses: [paypalAddress1, paypalAddress2],
                        }),
                        getConfig: () => ({
                            ...defaultStoreConfig,
                            checkoutSettings: {
                                ...defaultStoreConfig.checkoutSettings,
                                providerWithCustomCheckout:
                                    PaymentIntegrationApi.PaymentMethodId
                                        .BraintreeAcceleratedCheckout,
                            },
                        }),
                        getCustomer: () => ({
                            ...defaultCustomer,
                            addresses: [],
                        }),
                    },
                },
            })),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders with PP addresses, selected PP address', () => {
        render(<PayPalFastlaneAddressComponentMock selectedAddress={paypalAddress1} />);

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalFastlaneAddress')).toHaveTextContent('true');
        expect(screen.getByTestId('shouldShowPayPalFastlaneLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(2);
        expect(addressItems[0]).toHaveTextContent('address-PP1');
        expect(addressItems[1]).toHaveTextContent('address-PP2');
    });
});
