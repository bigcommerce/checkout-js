import React from 'react';
import ReactDOM from 'react-dom';

import { configurePublicPath } from '../common/bundler';

import { CheckoutAppProps } from './CheckoutApp';

export interface RenderCheckoutOptions extends CheckoutAppProps {
    publicPath: string;
}

export default function renderCheckout({
    containerId,
    publicPath,
    ...props
}: RenderCheckoutOptions): void {
    configurePublicPath(publicPath);

    const { default: CheckoutApp } = require('./CheckoutApp');

    ReactDOM.render(
        <CheckoutApp
            containerId={ containerId }
            { ...props }
        />,
        document.getElementById(containerId)
    );
}
