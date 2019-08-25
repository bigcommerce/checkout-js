import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import CheckoutButton from './CheckoutButton';
import CheckoutButtonList from './CheckoutButtonList';

describe('CheckoutButtonList', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot', () => {
        const component = render(
            <LocaleContext.Provider value={ localeContext }>
                <CheckoutButtonList
                    methodIds={ ['amazon', 'braintreevisacheckout'] }
                    deinitialize={ noop }
                    initialize={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component)
            .toMatchSnapshot();
    });

    it('filters out unsupported methods', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CheckoutButtonList
                    methodIds={ ['amazon', 'braintreevisacheckout', 'foobar'] }
                    deinitialize={ noop }
                    initialize={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component.find(CheckoutButton))
            .toHaveLength(2);
    });

    it('does not render if there are no supported methods', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CheckoutButtonList
                    methodIds={ ['foobar'] }
                    deinitialize={ noop }
                    initialize={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component.html())
            .toBeFalsy();
    });

    it('passes data to every checkout button', () => {
        const deinitialize = jest.fn();
        const initialize = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CheckoutButtonList
                    methodIds={ ['amazon', 'braintreevisacheckout'] }
                    deinitialize={ deinitialize }
                    initialize={ initialize }
                />
            </LocaleContext.Provider>
        );

        expect(component.find(CheckoutButton).at(0).props())
            .toEqual({
                containerId: 'amazonCheckoutButton',
                methodId: 'amazon',
                deinitialize,
                initialize,
            });
    });

    it('notifies parent if methods are incompatible with Embedded Checkout', () => {
        const methodIds = ['amazon', 'braintreevisacheckout'];
        const onError = jest.fn();
        const checkEmbeddedSupport = jest.fn(() => { throw new Error(); });

        render(
            <LocaleContext.Provider value={ localeContext }>
                <CheckoutButtonList
                    methodIds={ methodIds }
                    checkEmbeddedSupport={ checkEmbeddedSupport }
                    deinitialize={ noop }
                    initialize={ noop }
                    onError={ onError }
                />
            </LocaleContext.Provider>
        );

        expect(checkEmbeddedSupport)
            .toHaveBeenCalledWith(methodIds);

        expect(onError)
            .toHaveBeenCalledWith(expect.any(Error));
    });
});
