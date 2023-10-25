import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { StaticAddress } from '../address/';
import { getFormFields } from '../address/formField.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import { getShippingAddress } from './shipping-addresses.mock';
import ShippingAddress, { ShippingAddressProps } from './ShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';
import StaticAddressEditable from './StaticAddressEditable';

describe('ShippingAddress Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let wrapperComponent: ReactWrapper;
    let TestComponent: FunctionComponent<Partial<ShippingAddressProps>>;
    let defaultProps: ShippingAddressProps;

    beforeAll(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            consignments: [getConsignment()],
            addresses: getCustomer().addresses,
            shippingAddress: {
                ...getShippingAddress(),
                address1: 'x',
            },
            countriesWithAutocomplete: [],
            isLoading: false,
            isShippingStepPending: false,
            hasRequestedShippingOptions: false,
            formFields: getFormFields(),
            onAddressSelect: jest.fn(),
            onFieldChange: jest.fn(),
            initialize: jest.fn(),
            deinitialize: jest.fn(),
            onUnhandledError: jest.fn(),
            onUseNewAddress: jest.fn(),
        };

        TestComponent = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <ShippingAddress {...defaultProps} {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when no method id is provided', () => {
        it('renders ShippingAddressForm with expected props', () => {
            const component = shallow(<ShippingAddress {...defaultProps} />);

            expect(component.find(ShippingAddressForm).props()).toEqual(
                expect.objectContaining({
                    formFields: defaultProps.formFields,
                    addresses: defaultProps.addresses,
                    onUseNewAddress: defaultProps.onUseNewAddress,
                    address: defaultProps.shippingAddress,
                }),
            );
        });

        it('calls onAddressSelect when an address is selected', async () => {
            wrapperComponent = mount(<TestComponent />);
            wrapperComponent.find('#addressToggle').simulate('click');
            wrapperComponent.find('#addressDropdown li').at(1).find('a').simulate('click');

            await new Promise((resolve) => process.nextTick(resolve));

            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('does not render StaticAddress if method id is not sent', () => {
            const component = mount(<TestComponent {...defaultProps} />,
            );

            expect(component.find(StaticAddress)).toHaveLength(0);
        });
    });

    describe('when method id is provided', () => {
        it('does not render ShippingAddressForm', () => {
            const component = mount(
                <TestComponent {...defaultProps} methodId="amazonpay" />,
            );

            expect(component.find(ShippingAddressForm)).toHaveLength(0);
        });

        it('renders a StaticAddressEditable if methodId is amazon pay', () => {
            const component = mount(
                <TestComponent {...defaultProps} methodId="amazonpay" />,
            );

            expect(component.find(StaticAddressEditable)).toHaveLength(1);
        });
    });
});
