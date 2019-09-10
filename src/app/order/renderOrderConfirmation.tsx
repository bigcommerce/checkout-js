import React from 'react';
import ReactDOM from 'react-dom';

import { configurePublicPath } from '../common/bundler';

import { OrderConfirmationAppProps } from './OrderConfirmationApp';

export interface RenderOrderConfirmationOptions extends OrderConfirmationAppProps {
    publicPath: string;
}

export default function renderOrderConfirmation({
    containerId,
    publicPath,
    ...props
}: RenderOrderConfirmationOptions): void {
    configurePublicPath(publicPath);

    const { default: OrderConfirmationApp } = require('./OrderConfirmationApp');

    ReactDOM.render(
        <OrderConfirmationApp
            containerId={ containerId }
            { ...props }
        />,
        document.getElementById(containerId)
    );
}
