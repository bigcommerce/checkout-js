import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { noop } from 'lodash';
import React, { ComponentType } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';

import CheckoutButtonList, { CheckoutButtonListProps } from './CheckoutButtonListV2';

const FooButton: ComponentType<CheckoutButtonProps> = () => <button>Foo</button>;

const DefaultButton: ComponentType<CheckoutButtonProps> = () => <button>Default</button>;

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
            methodIds: ['foo', 'bar']
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutService, 'subscribe').mockImplementation((subscriber) => {
            subscriber(checkoutState);

            return noop;
        });

        CheckoutButtonListTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <CheckoutButtonList {...defaultProps} />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders list of checkout buttons', () => {
        jest.spyOn(checkoutState.statuses, 'isInitializingCustomer').mockReturnValue(false);

        const component = mount(<CheckoutButtonListTest {...defaultProps} />);

        expect(component.find(DefaultButton)).toHaveLength(1);
        expect(component.find(FooButton)).toHaveLength(1);
    });
});
