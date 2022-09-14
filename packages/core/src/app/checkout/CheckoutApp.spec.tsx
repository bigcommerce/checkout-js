import { shallow } from 'enzyme';
import React from 'react';

import Checkout from './Checkout';
import CheckoutApp, { CheckoutAppProps } from './CheckoutApp';
import CheckoutProvider from './CheckoutProvider';
import { getCheckout } from './checkouts.mock';

describe('CheckoutApp', () => {
    let defaultProps: CheckoutAppProps;
    let container: HTMLElement;

    beforeEach(() => {
        defaultProps = {
            checkoutId: getCheckout().id,
            containerId: 'checkout-app',
        };

        container = document.createElement('div');
        container.id = 'checkout-app';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('renders checkout component', () => {
        const component = shallow(<CheckoutApp {...defaultProps} />);

        expect(component.find(Checkout)).toHaveLength(1);
    });

    it('provides checkout context', () => {
        const component = shallow(<CheckoutApp {...defaultProps} />);

        expect(component.find(CheckoutProvider)).toHaveLength(1);
    });
});
