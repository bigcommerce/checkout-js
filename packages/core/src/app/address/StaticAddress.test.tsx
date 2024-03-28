import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { getCountries } from '../geography/countries.mock';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import { getAddressFormFields } from './formField.mock';
import StaticAddress, { StaticAddressProps } from './StaticAddress';

jest.mock('@bigcommerce/checkout/ui', () => ({
    ...jest.requireActual('@bigcommerce/checkout/ui'),
    IconPayPalConnectSmall: () => (<div data-test="pp-connect-icon">IconPayPalFastlaneSmall</div>)
}));

jest.mock('@bigcommerce/checkout/paypal-fastlane-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/paypal-fastlane-integration'),
    usePayPalFastlaneAddress: jest.fn(() => ({
        isPayPalFastlaneEnabled: true,
        paypalFastlaneAddresses: [],
    })),
}));

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
        const view = render(<StaticAddressTest {...defaultProps} />);

        expect(view).toMatchSnapshot();
    });

    it('renders component when props are missing', () => {
        const view = render(
            <StaticAddressTest
                {...defaultProps}
                address={{
                    ...defaultProps.address,
                    phone: '',
                    address2: '',
                }}
            />,
        );

        expect(view).toMatchSnapshot();
    });

    it('renders component if required fields for billing address are not missing', () => {
        const view = mount(<StaticAddressTest {...defaultProps} type={AddressType.Billing} />);

        expect(checkoutState.data.getBillingAddressFields).toHaveBeenCalled();

        expect(view.find('.address-line-1').text()).toContain(defaultProps.address.address1);
    });

    it('does not render component if required fields for billing address are missing', () => {
        const view = mount(
            <StaticAddressTest
                {...defaultProps}
                address={{
                    ...defaultProps.address,
                    address1: '',
                }}
                type={AddressType.Billing}
            />,
        );

        expect(checkoutState.data.getBillingAddressFields).toHaveBeenCalled();

        expect(view.html()).toBe('');
    });

    it('renders component if required fields for shipping address are not missing', () => {
        const view = mount(
            <StaticAddressTest {...defaultProps} type={AddressType.Shipping} />,
        );

        expect(checkoutState.data.getShippingAddressFields).toHaveBeenCalled();

        expect(view.find('.address-line-1').text()).toContain(defaultProps.address.address1);
    });

    it('does not render component if required fields for shipping address are missing', () => {
        const view = mount(
            <StaticAddressTest
                {...defaultProps}
                address={{
                    ...defaultProps.address,
                    address1: '',
                }}
                type={AddressType.Shipping}
            />,
        );

        expect(checkoutState.data.getShippingAddressFields).toHaveBeenCalled();

        expect(view.html()).toBe('');
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

        const view = mount(
            <StaticAddressTest
                {...defaultProps}
                address={{
                    ...defaultProps.address,
                    customFields: [{ fieldId: 'foobar', fieldValue: '' }],
                }}
                type={AddressType.Billing}
            />,
        );

        expect(view.html()).not.toBe('');
    });

    describe('provider icon', () => {
        it('should not show icon, address is not from PP Fastlane', () => {
            const view = render(
                <StaticAddressTest
                    {...defaultProps}
                />
            );

            expect(view.find('[data-test="pp-fastlane-icon"]')).toHaveLength(0);
        });

        it('should show icon for PP Fastlane address', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
                isPayPalFastlaneEnabled: true,
                shouldShowPayPalConnectLabel: true,
                paypalFastlaneAddresses: [defaultProps.address],
            });

            const view = render(
                <StaticAddressTest
                    {...defaultProps}
                />
            );

            expect(view.find('[data-test="pp-connect-icon"]')).toHaveLength(1);
        });

        it('does not show PP icon for PP Fastlane address', () => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
                isPayPalFastlaneEnabled: true,
                shouldShowPayPalConnectLabel: false,
                shouldShowPayPalFastlaneLabel: true,
                paypalFastlaneAddresses: [defaultProps.address],
            });

            const view = render(
                <StaticAddressTest
                    {...defaultProps}
                />
            );

            expect(view.find('[data-test="pp-connect-icon"]')).toHaveLength(0);
        });
    });
});
