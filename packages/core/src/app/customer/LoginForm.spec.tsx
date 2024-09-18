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

    it('matches snapshot', () => {
        const component = render(<TestComponent />);

        expect(component).toMatchSnapshot();
    });

    it('renders form with initial values', () => {
        const component = mount(<TestComponent email="test@bigcommerce.com" />);

        expect(component.find('input[name="email"]').prop('value')).toBe('test@bigcommerce.com');
    });

    it('notifies when user clicks on "sign in" button', async () => {
        const handleSignIn = jest.fn();
        const component = mount(<TestComponent onSignIn={handleSignIn} />);

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component
            .find('input[name="password"]')
            .simulate('change', { target: { value: 'password1', name: 'password' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSignIn).toHaveBeenCalled();
    });

    it('displays error message if email is not valid', () => {
        async function getEmailError(value: string): Promise<string> {
            const component = mount(<TestComponent />);

            component
                .find('input[name="email"]')
                .simulate('change', { target: { value, name: 'email' } });

            component.find('form').simulate('submit');

            await new Promise((resolve) => process.nextTick(resolve));

            component.update();

            return component.find('[data-test="email-field-error-message"]').text();
        }

        const invalidEmailMessage = 'Email address must be valid';

        expect(getEmailError('test@bigcommerce')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('@test.test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@.test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@test.')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@te st.test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@test.comtest@test.com')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('漢漢漢漢漢漢@漢漢漢漢漢漢.漢漢漢漢漢漢')).resolves.toEqual(
            invalidEmailMessage,
        );
    });

    it('displays error message if password is missing', async () => {
        const component = mount(<TestComponent />);

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('[data-test="password-field-error-message"]').text()).toBe(
            'Password is required',
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

    it('renders error as alert if password is incorrect', () => {
        const error = Object.assign(new Error(), { body: { type: 'invalid login' } });
        const component = mount(<TestComponent canCancel signInError={error} />);

        expect(component.find('[data-test="customer-login-error-message"]').text()).toBe(
            'The email or password you entered is not valid.',
        );
    });

    it('renders cancel button if able to cancel', () => {
        const component = mount(<TestComponent canCancel />);

        expect(component.exists('[data-test="customer-cancel-button"]')).toBe(true);
    });

    it('does not render cancel button by default', () => {
        const component = mount(<TestComponent />);

        expect(component.exists('[data-test="customer-cancel-button"]')).toBe(false);
    });

    it('notifies when user changes email address', () => {
        const handleChangeEmail = jest.fn();
        const component = mount(<TestComponent onChangeEmail={handleChangeEmail} />);

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        expect(handleChangeEmail).toHaveBeenCalledWith('test@bigcommerce.com');
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

    it('disables submit button if the sign in process does not complete', async () => {
        const component = mount(
            <TestComponent isSigningIn={true} />,
        );

        const button = component.find('[data-test="customer-continue-button"]');

        expect(button.prop('disabled')).toBeTruthy();
    });

    it('disables submit button if the execution is in progress', async () => {
        const component = mount(
            <TestComponent isExecutingPaymentMethodCheckout={true} />,
        );

        const button = component.find('[data-test="customer-continue-button"]');

        expect(button.prop('disabled')).toBeTruthy();
    });
});
