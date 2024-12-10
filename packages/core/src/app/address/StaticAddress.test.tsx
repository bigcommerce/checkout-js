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
import { getCountries } from '../geography/countries.mock';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import { getAddressFormFields } from './formField.mock';
import StaticAddress, { StaticAddressProps } from './StaticAddress';

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

        jest.spyOn(checkoutState.data, 'getBillingCountries').mockReturnValue(getCountries());
        jest.spyOn(checkoutState.data, 'getShippingCountries').mockReturnValue(getCountries());

        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

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

        expect(checkoutState.data.getBillingAddressFields).toHaveBeenCalled();

        expect(screen.getByText(defaultProps.address.address1)).toBeInTheDocument();
    });

    it('does not render component if its not valid (due to missing required billing props)', () => {
        render(
            <StaticAddressTest
                address={{
                    ...defaultProps.address,
                    address1: '',
                }}
                type={AddressType.Billing}
            />,
        );

        expect(checkoutState.data.getBillingAddressFields).toHaveBeenCalled();
        expect(screen.queryByTestId('static-address')).not.toBeInTheDocument();
    });

    it('renders component if required fields for shipping address are not missing', () => {
        render(<StaticAddressTest {...defaultProps} type={AddressType.Shipping} />,);

        expect(checkoutState.data.getShippingAddressFields).toHaveBeenCalled();
        expect(screen.getByText(defaultProps.address.address1)).toBeInTheDocument();
    });

    it('does not render component if its not valid (due to missing required shipping props)', () => {
        render(
            <StaticAddressTest
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
