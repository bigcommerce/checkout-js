import React, { type FunctionComponent } from 'react';

import { configurePublicPath } from '../common/bundler';

import { type CheckoutAppProps } from './CheckoutApp';
import renderCheckout, { type RenderCheckoutOptions } from './renderCheckout';

let CheckoutApp: FunctionComponent<CheckoutAppProps>;
let publicPath: string;

jest.mock('@welldone-software/why-did-you-render', () => jest.fn());

jest.mock('../common/bundler', () => {
    const configurePublicPath = jest.fn((path) => {
        publicPath = path;

        return publicPath;
    });

    return {
        configurePublicPath,
    };
});

jest.mock('./CheckoutApp', () => {
    CheckoutApp = jest.fn(() => <>{publicPath}</>);

    return {
        default: CheckoutApp,
    };
});

describe('renderCheckout()', () => {
    let container: HTMLElement;
    let options: RenderCheckoutOptions;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'app';

        document.body.appendChild(container);

        options = {
            checkoutId: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
            containerId: 'app',
            publicPath: 'https://foobar.com/assets/',
        };
    });

    afterEach(() => {
        container.remove();

        publicPath = '';
    });

    it('configures public path before mounting app component', () => {
        renderCheckout(options);

        expect(configurePublicPath).toHaveBeenCalledWith(options.publicPath);

        expect(container.innerHTML).toEqual(options.publicPath);
    });

    it('passes props to app component', () => {
        renderCheckout(options);

        expect(CheckoutApp).toHaveBeenCalledWith(options, {});
    });

    it('does not configure `whyDidYouRender` if not in development mode', () => {
        renderCheckout(options);

        expect(require('@welldone-software/why-did-you-render')).not.toHaveBeenCalled();

        process.env.NODE_ENV = 'development';
    });

    it('configures `whyDidYouRender` if in development mode', () => {
        const env = process.env.NODE_ENV;

        process.env.NODE_ENV = 'development';

        renderCheckout(options);

        expect(require('@welldone-software/why-did-you-render')).toHaveBeenCalledWith(React, {
            collapseGroups: true,
        });

        process.env.NODE_ENV = env;
    });
});
