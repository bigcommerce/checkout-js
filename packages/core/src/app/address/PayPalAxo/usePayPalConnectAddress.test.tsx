import { Address, PaymentProviderCustomer } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import * as PaymentIntegrationApi from '@bigcommerce/checkout/payment-integration-api';
import { getAddress } from '@bigcommerce/checkout/test-utils';

import usePayPalConnectAddress from './usePayPalConnectAddress';

interface PayPalAxoAddressComponentProps {
    selectedAddress: Address;
    addresses: Address[];
}

const PayPalAxoAddressComponent = ({
    selectedAddress,
    addresses = [],
}: PayPalAxoAddressComponentProps) => {
    const {
        isPayPalConnectAddress,
        shouldShowPayPalConnectLabel,
        mergeAddresses,
    } = usePayPalConnectAddress();
    const mergedAddresses = mergeAddresses(addresses);

    return (
        <>
            <div data-test="isPayPalConnectAddress">
                {isPayPalConnectAddress(selectedAddress) ? 'true' : 'false'}
            </div>
            <div data-test="shouldShowPayPalConnectLabel">
                {shouldShowPayPalConnectLabel() ? 'true' : 'false'}
            </div>
            <ul>
                {mergedAddresses.map((address, index) => (
                    <li key={index}>{address.address1}</li>
                ))}
            </ul>
        </>
    );
};

describe('usePayPalConnectAddress', () => {
    const useCheckoutMock = (paymentProviderCustomer: PaymentProviderCustomer) => {
        jest.spyOn(PaymentIntegrationApi, 'useCheckout').mockImplementation(
            jest.fn().mockImplementation(() => ({
                checkoutState: {
                    data: {
                        getPaymentProviderCustomer: () => paymentProviderCustomer
                    }
                }
            }))
        );
    };


    const defaultAdderss = getAddress();
    const addressBC1 = {
        ...defaultAdderss,
        address1: 'address-BC1',
    };
    const addressBC2 = {
        ...defaultAdderss,
        address1: 'address-BC2-PP1',
    };
    const addressPP1 = {
        ...addressBC2
    };
    const addressPP2 = {
        ...defaultAdderss,
        address1: 'address-PP2',
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders with BC addresses & no PP Connect addresses, selected BC address', () => {
        useCheckoutMock({});

        render(
            <PayPalAxoAddressComponent
                addresses={[addressBC1, addressBC2]}
                selectedAddress={addressBC1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('false');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('false');
        expect(addressItems).toHaveLength(2);
        expect(addressItems[0]).toHaveTextContent('address-BC1');
        expect(addressItems[1]).toHaveTextContent('address-BC2-PP1');
    });

    it('renders with PP Connect addresses & no BC addresses, selected PP address', () => {
        useCheckoutMock({
            addresses: [addressPP1, addressPP2],
        });

        render(
            <PayPalAxoAddressComponent
                addresses={[]}
                selectedAddress={addressPP1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('true');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(2);
        expect(addressItems[0]).toHaveTextContent('address-BC2-PP1');
        expect(addressItems[1]).toHaveTextContent('address-PP2');
    });

    it('renders with BC addresses & PP Connect address, selected BC address', () => {
        useCheckoutMock({
            addresses: [addressPP2],
        });

        render(
            <PayPalAxoAddressComponent
                addresses={[addressBC1, addressBC2]}
                selectedAddress={addressBC1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('false');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(3);
        expect(addressItems[0]).toHaveTextContent('address-PP2');
        expect(addressItems[1]).toHaveTextContent('address-BC1');
        expect(addressItems[2]).toHaveTextContent('address-BC2-PP1');
    });

    it('renders with BC addresses & PP Connect address - with address merge, selected PP address', () => {
        useCheckoutMock({
            addresses: [addressPP1, addressPP2],
        });

        render(
            <PayPalAxoAddressComponent
                addresses={[addressBC1, addressBC2]}
                selectedAddress={addressPP1}
            />
        );

        const addressItems = screen.getAllByRole('listitem');

        expect(screen.getByTestId('isPayPalConnectAddress')).toHaveTextContent('true');
        expect(screen.getByTestId('shouldShowPayPalConnectLabel')).toHaveTextContent('true');
        expect(addressItems).toHaveLength(3);
        expect(addressItems[0]).toHaveTextContent('address-BC2-PP1');
        expect(addressItems[1]).toHaveTextContent('address-PP2');
        expect(addressItems[2]).toHaveTextContent('address-BC1');
    });
});
