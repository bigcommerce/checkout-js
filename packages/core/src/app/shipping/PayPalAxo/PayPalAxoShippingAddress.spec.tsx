import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getConsignment, getCustomer, getShippingAddress, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import { getFormFields } from '../../address/formField.mock';
import StaticAddressEditable from '../StaticAddressEditable';

import PayPalAxoShippingAddress, { PayPalAxoShippingAddressProps } from './PayPalAxoShippingAddress';
import PayPalAxoShippingAddressForm from './PayPalAxoShippingAddressForm';
import PayPalAxoStaticAddress from './PayPalAxoStaticAddress';

describe('PayPalAxoShippingAddress Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let wrapperComponent: ReactWrapper;
    let TestComponent: FunctionComponent<Partial<PayPalAxoShippingAddressProps>>;
    let defaultProps: PayPalAxoShippingAddressProps;

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
                        <PayPalAxoShippingAddress {...props} {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when no method id is provided', () => {
        it('renders ShippingAddressForm with expected props', () => {
            const component = shallow(<PayPalAxoShippingAddress {...defaultProps} />);

            expect(component.find(PayPalAxoShippingAddressForm).props()).toEqual(
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
            const component = mount(<TestComponent />);

            expect(component.find(PayPalAxoStaticAddress)).toHaveLength(0);
        });
    });

    describe('when method id is provided', () => {
        it('does not render ShippingAddressForm', () => {
            const component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <PayPalAxoShippingAddress {...defaultProps} methodId="amazonpay" />
                </Formik>,
            );

            expect(component.find(PayPalAxoShippingAddressForm)).toHaveLength(0);
        });

        it('renders a StaticAddressEditable if methodId is amazon pay', () => {
            const component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <PayPalAxoShippingAddress {...defaultProps} methodId="amazonpay" />
                </Formik>,
            );

            expect(component.find(StaticAddressEditable)).toHaveLength(1);
        });
    });
});
