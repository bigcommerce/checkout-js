import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
    TranslatedHtml,
    TranslatedLink,
} from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';
import { Alert } from '../ui/alert';

import CustomerViewType from './CustomerViewType';
import LoginForm, { LoginFormProps } from './LoginForm';

describe('LoginForm', () => {
    let defaultProps: LoginFormProps;
    let localeContext: LocaleContextType;
    let TestComponent: FunctionComponent<Partial<LoginFormProps>>;

    beforeEach(() => {
        defaultProps = {
            continueAsGuestButtonLabelId: 'customer.continue_as_guest_action',
            forgotPasswordUrl: '/forgot-password',
            onSignIn: jest.fn(),
        };

        localeContext = createLocaleContext(getStoreConfig());

        TestComponent = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <LoginForm {...defaultProps} {...props} />
            </LocaleContext.Provider>
        );
    });

    it('renders SuggestedLogin (no email input, suggestion, continue as guest) and ignores canCancel flag', () => {
        const onCancel = jest.fn();
        const component = mount(
            <TestComponent
                canCancel
                email="foo@bar.com"
                onCancel={onCancel}
                viewType={CustomerViewType.SuggestedLogin}
            />,
        );

        expect(component.find(Alert).prop('type')).toBe('info');

        expect(component.find(Alert).find(TranslatedHtml).props()).toEqual({
            id: 'customer.guest_could_login',
            data: { email: 'foo@bar.com' },
        });

        expect(component.exists('[data-test="customer-cancel-button"]')).toBe(false);

        expect(component.exists('[data-test="customer-guest-continue"]')).toBe(true);

        component.find('[data-test="change-email"]').simulate('click');

        expect(onCancel).toHaveBeenCalled();

        expect(component.exists('input[name="email"]')).toBe(false);
    });

    it('renders info alert if CancellableEnforcedLogin, and hides email input', () => {
        const component = mount(
            <TestComponent
                canCancel
                email="foo@bar.com"
                viewType={CustomerViewType.CancellableEnforcedLogin}
            />,
        );

        expect(component.find(Alert).prop('type')).toBe('info');

        expect(component.find(Alert).find(TranslatedHtml).props()).toEqual({
            id: 'customer.guest_must_login',
            data: { email: 'foo@bar.com' },
        });

        expect(component.exists('input[name="email"]')).toBe(false);
    });

    it('renders guest is temporary disabled alert if EnforcedLogin, and ignores canCancel flag', () => {
        const component = mount(
            <TestComponent
                canCancel
                email="foo@bar.com"
                viewType={CustomerViewType.EnforcedLogin}
            />,
        );

        expect(component.find(Alert).prop('type')).toBe('error');

        expect(component.find(Alert).find(TranslatedLink).prop('id')).toBe(
            'customer.guest_temporary_disabled',
        );

        expect(component.exists('input[name="email"]')).toBe(true);

        expect(component.exists('[data-test="customer-cancel-button"]')).toBe(false);
    });

    it('shows different "Continue as guest" button label if another label id was provided', () => {
        const component = mount(
            <TestComponent
                continueAsGuestButtonLabelId="customer.continue"
                viewType={CustomerViewType.SuggestedLogin}
            />,
        );

        expect(component.find('[data-test="customer-guest-continue"]').text()).not.toBe(
            'Continue as guest',
        );
    });
});
