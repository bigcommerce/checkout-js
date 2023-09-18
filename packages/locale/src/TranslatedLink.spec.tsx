import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import TranslatedLink from './TranslatedLink';

describe('TranslatedLink Component', () => {
    it('renders translated link', () => {
        expect(
            render(
                <TranslatedLink
                    data={{ email: 'foo@bar' }}
                    id="customer.guest_could_login_change_email"
                    onClick={noop}
                />,
            ),
        ).toMatchSnapshot();
    });

    it('renders translated text if theres no link', () => {
        expect(
            mount(
                <TranslatedLink
                    data={{ email: 'foo@bar' }}
                    id="customer.create_account_action"
                    onClick={noop}
                />,
            ).html(),
        ).toBe('Create Account');
    });

    it('calls onClick when link is clicked', () => {
        const onClick = jest.fn();

        mount(
            <TranslatedLink
                id="customer.guest_could_login_change_email"
                onClick={onClick}
                testId="link"
            />,
        )
            .find('[data-test="link"]')
            .simulate('click');

        expect(onClick).toHaveBeenCalled();
    });
});
