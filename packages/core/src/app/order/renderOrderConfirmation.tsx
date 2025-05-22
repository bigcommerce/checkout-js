import React from 'react';
import ReactDOM from 'react-dom';

import { configurePublicPath } from '../common/bundler';

import { OrderConfirmationAppProps } from './OrderConfirmationApp';

export type RenderOrderConfirmationOptions = OrderConfirmationAppProps;
export type RenderOrderConfirmation = typeof renderOrderConfirmation;

export default function renderOrderConfirmation({
    containerId,
    publicPath,
    ...props
}: RenderOrderConfirmationOptions): void {
    const configuredPublicPath = configurePublicPath(publicPath);

    // We want to use `require` here because we want to set up the public path
    // first before importing the app component and its dependencies.
    const { default: OrderConfirmationApp } = require('./OrderConfirmationApp');

    // We want to use `require` here because we only want to import the package
    // in development mode.
    if (process.env.NODE_ENV === 'development') {
        const whyDidYouRender = require('@welldone-software/why-did-you-render');

        whyDidYouRender(React, {
            collapseGroups: true,
        });
    }

    ReactDOM.render(
        <OrderConfirmationApp
            containerId={containerId}
            publicPath={configuredPublicPath}
            {...props}
        />,
        document.getElementById(containerId),
    );
}
