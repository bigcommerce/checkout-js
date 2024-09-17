import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import LocaleContext, { LocaleContextType } from './LocaleContext';
import LocaleProvider from './LocaleProvider';

describe('LocaleProvider', () => {
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('provides locale context to child components', () => {
        const Child: FunctionComponent<LocaleContextType> = jest.fn(() => null);
        const component = mount(
            <LocaleProvider checkoutService={checkoutService}>
                <LocaleContext.Consumer>
                    {(props) => props && <Child {...props} />}
                </LocaleContext.Consumer>
            </LocaleProvider>,
        );

        expect(component.find(Child).prop('currency')).toBeDefined();

        expect(component.find(Child).prop('language')).toBeDefined();

        expect(component.find(Child).prop('date')).toBeDefined();
    });

    it('provides locale context without currency service and date to child components when config is not available yet', () => {
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(undefined);

        const Child: FunctionComponent<LocaleContextType> = jest.fn(() => null);
        const component = mount(
            <LocaleProvider checkoutService={checkoutService}>
                <LocaleContext.Consumer>
                    {(props) => props && <Child {...props} />}
                </LocaleContext.Consumer>
            </LocaleProvider>,
        );

        expect(component.find(Child).prop('currency')).toBeUndefined();

        expect(component.find(Child).prop('language')).toBeDefined();

        expect(component.find(Child).prop('date')).toBeUndefined();
    });
});
