import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getAddress } from '@bigcommerce/checkout/test-utils';

import AddressType from '../../address/AddressType';
import { getAddressFormFields } from '../../address/formField.mock';
import { getCountries } from '../../geography/countries.mock';

import PayPalAxoStaticAddress, { PayPalAxoStaticAddressProps } from './PayPalAxoStaticAddress';
import * as usePayPalConnectAddress from './usePayPalConnectAddress';

// jest.mock('../../ui/icon/IconPayPalConnectSmall', () => () => <div data-test="PayPalConnectIcon">PayPalConnectIcon</div>);
jest.mock('@bigcommerce/checkout/ui', () => ({
    IconPayPalConnectSmall: () => <div data-test="PayPalConnectIcon">PayPalConnectIcon</div>,
}));

describe('StaticAddress Component', () => {
    let StaticAddressTest: FunctionComponent<PayPalAxoStaticAddressProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PayPalAxoStaticAddressProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            address: getAddress(),
        };

        jest.spyOn(checkoutState.data, 'getBillingCountries').mockReturnValue(getCountries());

        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: () => false,
            }))
        );

        StaticAddressTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PayPalAxoStaticAddress {...props} />
            </CheckoutProvider>
        );
    });

    it('renders component with supplied props', () => {
        const tree = render(<StaticAddressTest {...defaultProps} />);

        expect(tree).toMatchSnapshot();
    });

    it('renders component when props are missing', () => {
        const tree = render(
            <StaticAddressTest
                {...defaultProps}
                address={{
                    ...defaultProps.address,
                    phone: '',
                    address2: '',
                }}
            />,
        );

        expect(tree).toMatchSnapshot();
    });

    it('renders component if required fields for billing address are not missing', () => {
        const container = mount(<StaticAddressTest {...defaultProps} type={AddressType.Billing} />);

        expect(checkoutState.data.getBillingAddressFields).toHaveBeenCalled();

        expect(container.find('.address-line-1').text()).toContain(defaultProps.address.address1);
    });

    it('does not render component if required fields for billing address are missing', () => {
        const container = mount(
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

        expect(container.html()).toBe('');
    });

    it('renders component if required fields for shipping address are not missing', () => {
        const container = mount(
            <StaticAddressTest {...defaultProps} type={AddressType.Shipping} />,
        );

        expect(checkoutState.data.getShippingAddressFields).toHaveBeenCalled();

        expect(container.find('.address-line-1').text()).toContain(defaultProps.address.address1);
    });

    it('does not render component if required fields for shipping address are missing', () => {
        const container = mount(
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

        expect(container.html()).toBe('');
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

        const container = mount(
            <StaticAddressTest
                {...defaultProps}
                address={{
                    ...defaultProps.address,
                    customFields: [{ fieldId: 'foobar', fieldValue: '' }],
                }}
                type={AddressType.Billing}
            />,
        );

        expect(container.html()).not.toBe('');
    });

    it('renders PayPal connect icon', () => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: () => true,
            }))
        );

        const container = mount(
            <StaticAddressTest
                {...defaultProps}
                type={AddressType.Shipping}
            />,
        );

        expect(container.find('[data-test="PayPalConnectIcon"]')).toHaveLength(1);
    });
});
