import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import LocaleContext from './LocaleContext';
import { getLocaleContext } from './localeContext.mock';
import TranslatedLink from './TranslatedLink';

describe('TranslatedLink Component', () => {
    const localeContext = getLocaleContext();

    jest.spyOn(localeContext.language, 'translate');

    it('renders translated link', () => {
        expect(
            render(
                <LocaleContext.Provider value={localeContext}>
                    <TranslatedLink
                        data={{ email: 'foo@bar' }}
                        id="customer.guest_could_login_change_email"
                        onClick={noop}
                    />
                </LocaleContext.Provider>,
            ),
        ).toMatchSnapshot();
    });

    it('renders translated text if theres no link', () => {
        expect(
            mount(
                <LocaleContext.Provider value={localeContext}>
                    <TranslatedLink
                        data={{ email: 'foo@bar' }}
                        id="customer.create_account_action"
                        onClick={noop}
                    />
                </LocaleContext.Provider>,
            ).html(),
        ).toBe('Create Account');
    });

    it('calls onClick when link is clicked', () => {
        const onClick = jest.fn();

        mount(
            <LocaleContext.Provider value={localeContext}>
                <TranslatedLink
                    id="customer.guest_could_login_change_email"
                    onClick={onClick}
                    testId="link"
                />
            </LocaleContext.Provider>,
        )
            .find('[data-test="link"]')
            .simulate('click');

        expect(onClick).toHaveBeenCalled();
    });
});
