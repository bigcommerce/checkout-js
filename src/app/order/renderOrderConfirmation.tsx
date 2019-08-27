import React from 'react';
import ReactDOM from 'react-dom';

import OrderConfirmationApp, { OrderConfirmationAppProps } from './OrderConfirmationApp';

function renderOrderConfirmation(props: OrderConfirmationAppProps): void {
    ReactDOM.render(
        <OrderConfirmationApp { ...props } />,
        document.getElementById(props.containerId)
    );
}

export default renderOrderConfirmation;
