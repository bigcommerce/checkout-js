import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';

import CheckoutStepType from '../../checkout/CheckoutStepType';

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
            step: { isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Shipping },
            onUnhandledError: jest.fn(),
        };

        ComponentTest = (props) => (
            <ExtensionProvider checkoutService={checkoutService}>
                <StripeShipping {...props} />
            </ExtensionProvider>
        );
    });

    it('loads shipping data  when component is mounted', () => {
        const component = mount(<ComponentTest {...defaultProps} />);

        expect(component.find(StripeShippingForm)).toHaveLength(1);
    });
});
