import React from 'react';
import ReactDOM from 'react-dom';

import { configurePublicPath } from '../common/bundler';

import { CheckoutAppProps } from './CheckoutApp';

export type RenderCheckoutOptions = CheckoutAppProps;
export type RenderCheckout = typeof renderCheckout;

export default function renderCheckout({
    containerId,
    publicPath,
    ...props
}: RenderCheckoutOptions): void {
    const configuredPublicPath = configurePublicPath(publicPath);

    // We want to use `require` here because we want to set up the public path
    // first before importing the app component and its dependencies.
    const { default: CheckoutApp } = require('./CheckoutApp');

    // We want to use `require` here because we only want to import the package
    // in development mode.
    if (process.env.NODE_ENV === 'development') {
        const whyDidYouRender = require('@welldone-software/why-did-you-render');

        whyDidYouRender(React, {
            collapseGroups: true,
        });
    }

    ReactDOM.render(
        <CheckoutApp containerId={containerId} publicPath={configuredPublicPath} {...props} />,
        document.getElementById(containerId),
    );
}
