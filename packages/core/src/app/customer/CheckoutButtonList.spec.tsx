import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButton from './CheckoutButton';
import CheckoutButtonList from './CheckoutButtonList';

describe('CheckoutButtonList', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot', () => {
        const component = render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={['amazonpay', 'braintreevisacheckout']}
                />
            </LocaleContext.Provider>,
        );

        expect(component).toMatchSnapshot();
    });

    it('filters out unsupported methods', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={['amazonpay', 'braintreevisacheckout', 'foobar']}
                />
            </LocaleContext.Provider>,
        );

        expect(component.find(CheckoutButton)).toHaveLength(2);
    });

    it('does not crash when no methods are passed', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList deinitialize={noop} initialize={noop} />
            </LocaleContext.Provider>,
        );

        expect(component.html()).toBeFalsy();
    });

    it('does not render if there are no supported methods', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList deinitialize={noop} initialize={noop} methodIds={['foobar']} />
            </LocaleContext.Provider>,
        );

        expect(component.html()).toBeFalsy();
    });

    it('does not render the translated string when initializing', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    deinitialize={noop}
                    initialize={noop}
                    isInitializing={true}
                    methodIds={['amazonpay', 'braintreevisacheckout']}
                />
            </LocaleContext.Provider>,
        );

        expect(component.find(TranslatedString)).toHaveLength(0);
    });

    it('passes data to every checkout button', () => {
        const deinitialize = jest.fn();
        const initialize = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    deinitialize={deinitialize}
                    initialize={initialize}
                    methodIds={['amazonpay', 'braintreevisacheckout']}
                />
            </LocaleContext.Provider>,
        );

        expect(component.find(CheckoutButton).at(0).props()).toEqual({
            containerId: 'amazonpayCheckoutButton',
            methodId: 'amazonpay',
            deinitialize,
            initialize,
        });
    });

    it('notifies parent if methods are incompatible with Embedded Checkout', () => {
        const methodIds = ['amazonpay', 'braintreevisacheckout'];
        const onError = jest.fn();
        const checkEmbeddedSupport = jest.fn(() => {
            throw new Error();
        });

        render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    checkEmbeddedSupport={checkEmbeddedSupport}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={methodIds}
                    onError={onError}
                />
            </LocaleContext.Provider>,
        );

        expect(checkEmbeddedSupport).toHaveBeenCalledWith(methodIds);

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
});
