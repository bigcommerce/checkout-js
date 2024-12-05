import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import { getAddressFormFields } from './formField.mock';
import SingleLineStaticAddress, { getAddressContent, SingleLineStaticAddressProps } from './SingleLineStaticAddress';

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

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                features: {
                    ...getStoreConfig().checkoutSettings.features,
                    "CHECKOUT-7560_address_fields_max_length_validation": false,
                }
            },
        });

        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

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

        expect(checkoutState.data.getShippingAddressFields).toHaveBeenCalled();

        expect(screen.getByText(defaultProps.address.address1, { exact: false })).toBeInTheDocument();
    });

    it('does not render component if its not valid (due to missing required shipping props)', () => {
        render(
            <SingleLineStaticAddressTest
                address={{
                    ...defaultProps.address,
                    address1: '',
                }}
                type={AddressType.Shipping}
            />,
        );

        expect(checkoutState.data.getShippingAddressFields).toHaveBeenCalled();
        expect(screen.queryByTestId('static-address')).not.toBeInTheDocument();
    });

    it('renders component if only custom fields are missing', () => {
        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue([
            ...getAddressFormFields(),
            {
                custom: true,
                default: undefined,
                fieldType: 'text',
                id: 'foobar',
                label: 'Custom number',
                name: 'foobar',
                required: true,
                type: 'integer',
            },
        ]);

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

    it('renders component even if required fields are missing when experiment is on', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                features: {
                    ...getStoreConfig().checkoutSettings.features,
                    "CHECKOUT-7560_address_fields_max_length_validation": true,
                }
            },
        });

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
