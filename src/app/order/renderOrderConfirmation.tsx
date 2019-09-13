import React from 'react';
import ReactDOM from 'react-dom';

import { configurePublicPath } from '../common/bundler';

import { OrderConfirmationAppProps } from './OrderConfirmationApp';

export type RenderOrderConfirmationOptions = OrderConfirmationAppProps;

export default function renderOrderConfirmation({
    containerId,
    publicPath,
    ...props
}: RenderOrderConfirmationOptions): void {
    const configuredPublicPath = configurePublicPath(publicPath);
    const { default: OrderConfirmationApp } = require('./OrderConfirmationApp');

    ReactDOM.render(
        <OrderConfirmationApp
            containerId={ containerId }
            publicPath={ configuredPublicPath }
            { ...props }
        />,
        document.getElementById(containerId)
    );
}
