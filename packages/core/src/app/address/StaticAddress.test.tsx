import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCountries } from '../geography/countries.mock';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import StaticAddress, { type StaticAddressProps } from './StaticAddress';

describe('StaticAddress Component', () => {
    let StaticAddressTest: FunctionComponent<StaticAddressProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: StaticAddressProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            address: getAddress(),
        };

        jest.spyOn(checkoutState.data, 'getBillingCountries').mockReturnValue(getCountries());
        jest.spyOn(checkoutState.data, 'getShippingCountries').mockReturnValue(getCountries());

        StaticAddressTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <StaticAddress {...props} />
            </CheckoutProvider>
        );
    });

    it('renders component with supplied props', () => {
        const { address } = defaultProps;

        render(<StaticAddressTest {...defaultProps} />);

        expect(screen.getByText(address.firstName)).toBeInTheDocument();
        expect(screen.getByText(address.lastName)).toBeInTheDocument();
        expect(screen.getByText(address.company)).toBeInTheDocument();
        expect(screen.getByText(address.address1)).toBeInTheDocument();
        expect(screen.getByText(`${address.city},`)).toBeInTheDocument();
        expect(screen.getByText(`${address.stateOrProvince},`)).toBeInTheDocument();
        expect(screen.getByText(address.country)).toBeInTheDocument();
        expect(screen.getByText(`${address.postalCode} /`)).toBeInTheDocument();
        expect(screen.getByText(address.phone)).toBeInTheDocument();
    });

    it('does not render phone field if it is empty', () => {
        render(<StaticAddressTest address={{ ...defaultProps.address, phone: '' }} />);

        expect(screen.queryByText(defaultProps.address.phone)).not.toBeInTheDocument();
    });

    it('renders component if required fields for billing address are not missing', () => {
        render(<StaticAddressTest {...defaultProps} type={AddressType.Billing} />);

        expect(screen.getByText(defaultProps.address.address1)).toBeInTheDocument();
    });

    it('renders component if required fields for shipping address are not missing', () => {
        render(<StaticAddressTest {...defaultProps} type={AddressType.Shipping} />,);

        expect(screen.getByText(defaultProps.address.address1)).toBeInTheDocument();
    });

    it('renders component if only custom fields are missing', () => {
        render(
            <StaticAddressTest
                address={{
                    ...defaultProps.address,
                    customFields: [{ fieldId: 'foobar', fieldValue: '' }],
                }}
                type={AddressType.Billing}
            />,
        );

        expect(screen.getByTestId('static-address')).toBeInTheDocument();
    });

    it('renders component even if required fields are missing', () => {
        render(
            <StaticAddressTest
                address={{
                    ...defaultProps.address,
                    address1: '',
                }}
                type={AddressType.Shipping}
            />,
        );

        expect(screen.getByTestId('static-address')).toBeInTheDocument();
    });
});
