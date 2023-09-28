import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import SignOutLink from './SignOutLink';

describe('SignOutLink', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = {
            language: createLanguageService(),
        };
    });

    it('renders output that matches snapshot', () => {
        const component = render(
            <LocaleContext.Provider value={localeContext}>
                <SignOutLink method={getPaymentMethod()} onSignOut={noop} />
            </LocaleContext.Provider>,
        );

        expect(component).toMatchSnapshot();
    });

    it('triggers callback when it is clicked', () => {
        const handleSignOut = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <SignOutLink method={getPaymentMethod()} onSignOut={handleSignOut} />
            </LocaleContext.Provider>,
        );

        component.find('a').simulate('click');

        expect(handleSignOut).toHaveBeenCalled();
    });
});
