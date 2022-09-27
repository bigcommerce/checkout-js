import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import OrderConfirmationApp, { OrderConfirmationAppProps } from './OrderConfirmationApp';

describe('OrderConfirmationApp', () => {
    let defaultProps: OrderConfirmationAppProps;
    let orderConfirmationApp: ShallowWrapper;
    let container: HTMLElement;

    beforeEach(() => {
        defaultProps = {
            orderId: 100,
            containerId: 'bar',
        };

        container = document.createElement('div');
        container.id = defaultProps.containerId;
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('renders app without crashing', () => {
        orderConfirmationApp = shallow(<OrderConfirmationApp {...defaultProps} />);

        expect(orderConfirmationApp).toBeTruthy();
    });
});
