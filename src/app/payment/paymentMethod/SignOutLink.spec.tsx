import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';

import SignOutLink from './SignOutLink';

describe('SignOutLink', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders output that matches snapshot', () => {
        const component = render(
            <LocaleContext.Provider value={ localeContext }>
                <SignOutLink
                    method={ getPaymentMethod() }
                    onSignOut={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component)
            .toMatchSnapshot();
    });

    it('triggers callback when it is clicked', () => {
        const handleSignOut = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <SignOutLink
                    method={ getPaymentMethod() }
                    onSignOut={ handleSignOut }
                />
            </LocaleContext.Provider>
        );

        component.find('a')
            .simulate('click');

        expect(handleSignOut)
            .toHaveBeenCalled();
    });
});
