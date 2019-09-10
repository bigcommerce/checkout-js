import { omit } from 'lodash';
import React, { FunctionComponent } from 'react';

import renderOrderConfirmation, { RenderOrderConfirmationOptions } from './renderOrderConfirmation';
import { OrderConfirmationAppProps } from './OrderConfirmationApp';

let OrderConfirmationApp: FunctionComponent<OrderConfirmationAppProps>;
let configurePublicPath: (path: string) => void;
let publicPath: string;

jest.mock('../common/bundler', () => {
    configurePublicPath = jest.fn(path => {
        publicPath = path;
    });

    return {
        configurePublicPath,
    };
});

jest.mock('./OrderConfirmationApp', () => {
    OrderConfirmationApp = jest.fn(() => <>{ publicPath }</>);

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

        expect(configurePublicPath)
            .toHaveBeenCalledWith(options.publicPath);

        expect(container.innerHTML)
            .toEqual(options.publicPath);
    });

    it('passes props to app component', () => {
        renderOrderConfirmation(options);

        expect(OrderConfirmationApp)
            .toHaveBeenCalledWith(omit(options, 'publicPath'), {});
    });
});
