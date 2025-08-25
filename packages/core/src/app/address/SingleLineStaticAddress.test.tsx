import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import SingleLineStaticAddress, { getAddressContent, type SingleLineStaticAddressProps } from './SingleLineStaticAddress';

describe('SingleLineStaticAddress Component', () => {
    let SingleLineStaticAddressTest: FunctionComponent<SingleLineStaticAddressProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: SingleLineStaticAddressProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            address: getAddress(),
        };

        SingleLineStaticAddressTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <SingleLineStaticAddress {...props} />
            </CheckoutProvider>
        );
    });

    it('renders component with supplied props', () => {
        const { address } = defaultProps;

        render(<SingleLineStaticAddressTest {...defaultProps} />);

        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();
    });

    it('renders component if required fields for shipping address are not missing', () => {
        render(<SingleLineStaticAddressTest {...defaultProps} type={AddressType.Shipping} />,);

        expect(screen.getByText(defaultProps.address.address1, { exact: false })).toBeInTheDocument();
    });

    it('renders component if only custom fields are missing', () => {
        render(
            <SingleLineStaticAddressTest
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
            <SingleLineStaticAddressTest
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
