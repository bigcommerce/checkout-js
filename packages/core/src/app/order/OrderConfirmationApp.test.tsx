import React from 'react';

import { render, waitFor } from '@bigcommerce/checkout/test-utils';

import OrderConfirmationApp, { OrderConfirmationAppProps } from './OrderConfirmationApp';

jest.mock('./OrderConfirmation', () => (props: any) => (
    <div className="orderConfirmationApp">Order Confirmation</div>
));

describe('OrderConfirmationApp', () => {
    let defaultProps: OrderConfirmationAppProps;

    beforeEach(() => {
        defaultProps = {
            orderId: 100,
            containerId: 'bar',
        };
    });

    it('renders app without crashing', async () => {
        const { container } = render(<div id={defaultProps.containerId}>
            <OrderConfirmationApp {...defaultProps} />
        </div>);

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.querySelector('.orderConfirmationApp')).toBeInTheDocument();
    });
});
