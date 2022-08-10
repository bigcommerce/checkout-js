import { createCheckoutService, CheckoutService, CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { CheckoutButtonProps, CheckoutButtonResolveId } from '@bigcommerce/checkout/payment-integration-api';
import { mount } from 'enzyme';
import { merge, noop } from 'lodash';
import React, { ComponentType } from 'react';

import { CheckoutProvider } from '../checkout';
import { LocaleProvider } from '../locale';
import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonList, { CheckoutButtonListProps } from './CheckoutButtonListV2';

const FooButton: ComponentType<CheckoutButtonProps> = () => (
    <button>Foo</button>
);

const DefaultButton: ComponentType<CheckoutButtonProps> = () => (
    <button>Default</button>
);

jest.mock('./resolveCheckoutButton', () => {
    return ({ id }: CheckoutButtonResolveId) => {
        if (id === 'foo') {
            return FooButton;
        }

        return DefaultButton;
    };
});

describe('CheckoutButtonListV2', () => {
    let defaultProps: CheckoutButtonListProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let CheckoutButtonListTest: ComponentType<CheckoutButtonListProps>;

    beforeEach(() => {
        defaultProps = {
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutService, 'subscribe')
            .mockImplementation(subscriber => {
                subscriber(checkoutState);

                return noop;
            });

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(merge(
                getStoreConfig(),
                {
                    checkoutSettings: {
                        remoteCheckoutProviders: ['foo', 'bar'],
                    },
                }
            ));

        CheckoutButtonListTest = () => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleProvider checkoutService={ checkoutService }>
                    <CheckoutButtonList { ...defaultProps } />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders list of checkout buttons', () => {
        jest.spyOn(checkoutState.statuses, 'isInitializingCustomer')
            .mockReturnValue(false);

        const component = mount(<CheckoutButtonListTest { ...defaultProps } />);

        expect(component.find(DefaultButton).length)
            .toEqual(1);
        expect(component.find(FooButton).length)
            .toEqual(1);
        expect(component.html())
            .toContain('<p>Or continue with</p>');
    });

    it('does not render "or continue with" while initializing', () => {
        jest.spyOn(checkoutState.statuses, 'isInitializingCustomer')
            .mockReturnValue(true);

        const component = mount(<CheckoutButtonListTest { ...defaultProps } />);

        expect(component.html())
            .not.toContain('<p>Or continue with</p>');
    });
});
