import React, { FunctionComponent } from 'react';

import { OrderConfirmationAppProps } from './OrderConfirmationApp';
import renderOrderConfirmation, { RenderOrderConfirmationOptions } from './renderOrderConfirmation';

let OrderConfirmationApp: FunctionComponent<OrderConfirmationAppProps>;
let configurePublicPath: (path: string) => void;
let publicPath: string;

jest.mock('@welldone-software/why-did-you-render', () => jest.fn());

jest.mock('../common/bundler', () => {
    configurePublicPath = jest.fn((path) => {
        publicPath = path;

        return publicPath;
    });

    return {
        configurePublicPath,
    };
});

jest.mock('./OrderConfirmationApp', () => {
    OrderConfirmationApp = jest.fn(() => <>{publicPath}</>);

    return {
        default: OrderConfirmationApp,
    };
});

describe('renderOrderConfirmation()', () => {
    let container: HTMLElement;
    let options: RenderOrderConfirmationOptions;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'app';

        document.body.appendChild(container);

        options = {
            containerId: 'app',
            orderId: 295,
            publicPath: 'https://foobar.com/assets/',
        };
    });

    afterEach(() => {
        container.remove();

        publicPath = '';
    });

    it('configures public path before mounting app component', () => {
        renderOrderConfirmation(options);

        expect(configurePublicPath).toHaveBeenCalledWith(options.publicPath);

        expect(container.innerHTML).toEqual(options.publicPath);
    });

    it('passes props to app component', () => {
        renderOrderConfirmation(options);

        expect(OrderConfirmationApp).toHaveBeenCalledWith(options, {});
    });

    it('does not configure `whyDidYouRender` if not in development mode', () => {
        renderOrderConfirmation(options);

        expect(require('@welldone-software/why-did-you-render')).not.toHaveBeenCalled();

        process.env.NODE_ENV = 'development';
    });

    it('configures `whyDidYouRender` if in development mode', () => {
        const env = process.env.NODE_ENV;

        process.env.NODE_ENV = 'development';

        renderOrderConfirmation(options);

        expect(require('@welldone-software/why-did-you-render')).toHaveBeenCalledWith(React, {
            collapseGroups: true,
        });

        process.env.NODE_ENV = env;
    });
});
