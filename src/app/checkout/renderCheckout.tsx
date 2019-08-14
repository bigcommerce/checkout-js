import React from 'react';
import ReactDOM from 'react-dom';

import CheckoutApp, { CheckoutAppProps } from './CheckoutApp';

export default function renderCheckout(
    props: CheckoutAppProps
) {
    ReactDOM.render(
        <CheckoutApp { ...props } />,
        document.getElementById(props.containerId)
    );
}
