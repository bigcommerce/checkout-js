import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import StripeV3CustomCardForm, { StripeV3CustomCardFormProps } from './StripeV3CustomCardForm';

describe('StripeV3CustomCardForm', () => {
    let defaultProps: StripeV3CustomCardFormProps;
    let StripeV3CustomCardFormTest: FunctionComponent<StripeV3CustomCardFormProps>;

    beforeEach(() => {
        defaultProps = {
            options: {
                cardNumberElementOptions: {
                    containerId: 'stripe-card-number-component-field',
                },
                cardExpiryElementOptions: {
                    containerId: 'stripe-expiry-component-field',
                },
                cardCvcElementOptions: {
                    containerId: 'stripe-cvc-component-field',
                },
            },
        };

        StripeV3CustomCardFormTest = (props) => <StripeV3CustomCardForm {...props} />;
    });

    it('renders stripeV3 card number field', () => {
        const container = mount(<StripeV3CustomCardFormTest {...defaultProps} />);

        expect(container.find('[id="stripe-card-number-component-field"]')).toHaveLength(1);
    });

    it('renders stripeV3 expiry date field', () => {
        const container = mount(<StripeV3CustomCardFormTest {...defaultProps} />);

        expect(container.find('#stripe-expiry-component-field')).toHaveLength(1);
    });

    it('renders stripeV3 CVV field', () => {
        const container = mount(<StripeV3CustomCardFormTest {...defaultProps} />);

        expect(container.find('#stripe-cvc-component-field')).toHaveLength(1);
    });
});
