import React from 'react';
import ReactDOM from 'react-dom';

import { configurePublicPath } from '../common/bundler';

import { CheckoutAppProps } from './CheckoutApp';

export type RenderCheckoutOptions = CheckoutAppProps;

export default function renderCheckout({
    containerId,
    publicPath,
    ...props
}: RenderCheckoutOptions): void {
    const configuredPublicPath = configurePublicPath(publicPath);
    const { default: CheckoutApp } = require('./CheckoutApp');

    ReactDOM.render(
        <CheckoutApp
            containerId={ containerId }
            publicPath={ configuredPublicPath }
            { ...props }
        />,
        document.getElementById(containerId)
    );
}
