import React from 'react';
import ReactDOM from 'react-dom';

import CheckoutApp, { CheckoutAppProps } from './CheckoutApp';

if (process.env.NODE_ENV === 'development') {
    // We want to use `require` because we only want to import the package in
    // development mode.
    // tslint:disable-next-line
    const { default: whyDidYouRender } = require('@welldone-software/why-did-you-render');

    whyDidYouRender(React);
}

export default function renderCheckoutNext(
    props: CheckoutAppProps
) {
    ReactDOM.render(
        <CheckoutApp { ...props } />,
        document.getElementById(props.containerId)
    );
}
