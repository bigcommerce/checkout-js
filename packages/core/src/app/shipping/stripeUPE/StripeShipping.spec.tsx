import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { LocaleProvider } from '@bigcommerce/checkout/locale';

import { getAddressFormFields } from '../../address/formField.mock';
import CheckoutStepType from '../../checkout/CheckoutStepType';
import { getConsignment } from '../consignment.mock';

import StripeShipping, { StripeShippingProps } from './StripeShipping';
import StripeShippingForm from './StripeShippingForm';

describe('Stripe Shipping Component', () => {
    const checkoutService = createCheckoutService();

    let defaultProps: StripeShippingProps;
    let ComponentTest: FunctionComponent<StripeShippingProps>;

    beforeEach(() => {

        defaultProps = {
            isBillingSameAsShipping: true,
            isMultiShippingMode: false,
            cartHasChanged: false,
            step: {
                isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Shipping
            },
            onUnhandledError: jest.fn(),
            getFields: jest.fn(() => getAddressFormFields()),
            consignments: [
                { ...getConsignment(), id: 'foo' },
                { ...getConsignment(), id: 'bar' },
            ],
        };

        ComponentTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <ExtensionProvider checkoutService={checkoutService}>
                    <StripeShipping {...defaultProps} {...props} />
                </ExtensionProvider>
            </LocaleProvider>
        );
    });

    it('loads shipping data  when component is mounted', () => {
        const component = mount(<ComponentTest />);

        expect(component.find(StripeShippingForm)).toHaveLength(1);
    });
});
