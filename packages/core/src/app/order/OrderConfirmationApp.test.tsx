import React from 'react';

import { render, waitFor } from '@bigcommerce/checkout/test-utils';

import OrderConfirmationApp, { OrderConfirmationAppProps } from './OrderConfirmationApp';

jest.mock('./OrderConfirmation', () => (props: any) => (
    <div className="orderConfirmationApp">Order Confirmation</div>
));

describe('OrderConfirmationApp', () => {
    let defaultProps: OrderConfirmationAppProps;
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

    it('renders app without crashing', async () => {
        const { container } = render(<OrderConfirmationApp {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('.orderConfirmationApp')).toBeInTheDocument();
    });
});
