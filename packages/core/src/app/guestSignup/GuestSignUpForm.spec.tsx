import { mount, ReactWrapper, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';

import GuestSignUpForm from './GuestSignUpForm';

describe('GuestSignUpForm', () => {
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    const handleSignUp = jest.fn();
    const passwordRequirements = {
        minLength: 5,
        description: 'Password should be ...',
        alpha: /w/,
        numeric: /d/,
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        component = mount(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={handleSignUp}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );
    });

    it('matches snapshot', () => {
        const shallowComponent = render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={noop}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        expect(shallowComponent).toMatchSnapshot();
    });

    it('matches snapshot when customer cannot be created', () => {
        const shallowComponent = render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={false}
                    onSignUp={noop}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        expect(shallowComponent).toMatchSnapshot();
    });

    it('notifies when user clicks on "create account" button', async () => {
        component
            .find('input[name="password"]')
            .simulate('change', { target: { value: 'password1', name: 'password' } });

        component
            .find('input[name="confirmPassword"]')
            .simulate('change', { target: { value: 'password1', name: 'confirmPassword' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSignUp).toHaveBeenCalled();
    });

    it('displays error message if password is not valid', async () => {
        component
            .find('input[name="password"]')
            .simulate('change', { target: { value: '1', name: 'password' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('[data-test="password-field-error-message"]').text()).toEqual(
            passwordRequirements.description,
        );
    });

    it('displays error message if passwords are missing', async () => {
        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('[data-test="password-field-error-message"]').text()).toEqual(
            passwordRequirements.description,
        );

        expect(component.find('[data-test="confirm-password-field-error-message"]').text()).toBe(
            'This field is required',
        );
    });

    it('displays error message if passwords do not match', async () => {
        component
            .find('input[name="password"]')
            .simulate('change', { target: { value: 'password1', name: 'password' } });

        component
            .find('input[name="confirmPassword"]')
            .simulate('change', { target: { value: 'password2', name: 'confirmPassword' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('[data-test="confirm-password-field-error-message"]').text()).toBe(
            'Passwords do not match',
        );
    });
});
