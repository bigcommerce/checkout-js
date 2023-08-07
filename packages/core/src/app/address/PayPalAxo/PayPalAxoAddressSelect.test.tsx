import { fireEvent, render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { getAddress } from '@bigcommerce/checkout/test-utils';

import * as isEqualAddress from '../../address/isEqualAddress';

import PayPalAxoAddressSelect, { PayPalAxoAddressSelectProps } from './PayPalAxoAddressSelect';
import * as usePayPalConnectAddress from './usePayPalConnectAddress';

jest.mock('../../ui/dropdown', () => ({
    DropdownTrigger: ({dropdown}: {dropdown: ReactNode}) => <div>{dropdown}</div>
}));
jest.mock('./PayPalAxoStaticAddress', () => () => <div>PayPalAxoStaticAddress</div>);
jest.mock('./PoweredByPaypalConnectLabel', () => () => <div>PoweredByPaypalConnectLabel</div>);
jest.mock('./PayPalAxoAddressSelectButton', () => () => <div>PayPalAxoAddressSelectButton</div>);

describe('PayPalAxoAddressSelect', () => {
    const defaultAddress = getAddress();
    const defaultProps: PayPalAxoAddressSelectProps = {
        addresses: [defaultAddress],
        onSelectAddress: jest.fn(),
        onUseNewAddress: jest.fn(),
    };

    beforeEach(() => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                shouldShowPayPalConnectLabel: jest.fn().mockReturnValue(false),
            }))
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders addresses list', () => {
        render(
            <PayPalAxoAddressSelect {...defaultProps} />
        );
        
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('select new address from dropdown', () => {
        const onUseNewAddressMock = jest.fn();

        render(
            <PayPalAxoAddressSelect
                {...defaultProps}
                onUseNewAddress={onUseNewAddressMock}
            />
        );

        const addNewAddress = screen.getByTestId('add-new-address');

        expect(addNewAddress).toBeInTheDocument();

        fireEvent.click(addNewAddress);

        expect(onUseNewAddressMock).toHaveBeenCalled();
    });

    it('select existing address from dropdown', () => {
        const onSelectAddressMock = jest.fn();

        render(
            <PayPalAxoAddressSelect
                {...defaultProps}
                onSelectAddress={onSelectAddressMock}
            />
        );

        const existingAddress = screen.getByText('PayPalAxoStaticAddress');

        expect(existingAddress).toBeInTheDocument();

        fireEvent.click(existingAddress);

        expect(onSelectAddressMock).toHaveBeenCalled();
    });

    it('select the same as selected address from dropdown', () => {
        const onSelectAddressMock = jest.fn();
        
        jest.spyOn(isEqualAddress, 'default').mockReturnValue(true);

        render(
            <PayPalAxoAddressSelect
                {...defaultProps}
                onSelectAddress={onSelectAddressMock}
            />
        );

        const existingAddress = screen.getByText('PayPalAxoStaticAddress');

        expect(existingAddress).toBeInTheDocument();

        fireEvent.click(existingAddress);

        expect(onSelectAddressMock).not.toHaveBeenCalled();
    });

    it('renders address select without PayPal connect label', () => {
        render(
            <PayPalAxoAddressSelect {...defaultProps} />
        );

        expect(screen.queryByText('PoweredByPaypalConnectLabel')).not.toBeInTheDocument();
    });

    it('renders address select with PayPal connect label', () => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                shouldShowPayPalConnectLabel: jest.fn().mockReturnValue(true),
            }))
        );

        render(
            <PayPalAxoAddressSelect {...defaultProps} />
        );

        expect(screen.getByText('PoweredByPaypalConnectLabel')).toBeInTheDocument();
    });
});
