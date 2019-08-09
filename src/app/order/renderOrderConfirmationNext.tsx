import React from 'react';
import ReactDOM from 'react-dom';

import OrderConfirmationApp from './OrderConfirmationApp';

export default function renderOrderConfirmationNext(
    containerId: string,
    orderId: number
) {
    ReactDOM.render(
        <OrderConfirmationApp
            orderId={ orderId }
            containerId={ containerId }
        />,
        document.getElementById(containerId)
    );
}
