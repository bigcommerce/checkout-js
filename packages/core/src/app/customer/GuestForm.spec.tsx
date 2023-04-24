import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';
import { PrivacyPolicyField } from '../privacyPolicy';

import GuestForm, { GuestFormProps } from './GuestForm';

describe('GuestForm', () => {
    let defaultProps: GuestFormProps;
    let localeContext: LocaleContextType;
    let TestComponent: FunctionComponent<Partial<GuestFormProps>>;

    beforeEach(() => {
        defaultProps = {
            canSubscribe: true,
            continueAsGuestButtonLabelId: 'customer.continue',
            defaultShouldSubscribe: false,
            isLoading: false,
            onChangeEmail: jest.fn(),
            onContinueAsGuest: jest.fn(),
            onShowLogin: jest.fn(),
            requiresMarketingConsent: false,
        };

        localeContext = createLocaleContext(getStoreConfig());

        TestComponent = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <GuestForm {...defaultProps} {...props} />
            </LocaleContext.Provider>
        );
    });

    it('matches snapshot', () => {
        const component = render(<TestComponent />);

        expect(component).toMatchSnapshot();
    });

    it('renders form with initial values', () => {
        const component = mount(
            <TestComponent defaultShouldSubscribe={true} email="test@bigcommerce.com" />,
        );

        expect(component.find('input[name="email"]').prop('value')).toBe('test@bigcommerce.com');

        expect(component.find('input[name="shouldSubscribe"]').prop('value')).toBe(true);
    });

    it('notifies when user clicks on "continue as guest" button', async () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(<TestComponent onContinueAsGuest={handleContinueAsGuest} />);

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component
            .find('input[name="shouldSubscribe"]')
            .simulate('change', { target: { value: true, name: 'shouldSubscribe' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleContinueAsGuest).toHaveBeenCalledWith({
            email: 'test@bigcommerce.com',
            privacyPolicy: false,
            shouldSubscribe: true,
        });
    });

    it('disables "continue as guest" button when isLoading is true', () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(
            <TestComponent isLoading={true} onContinueAsGuest={handleContinueAsGuest} />,
        );

        const button = component.find('[data-test="customer-continue-as-guest-button"]');

        expect(button.prop('disabled')).toBeTruthy();
    });

    it('displays error message if email is not valid', () => {
        async function getEmailError(value: string): Promise<string> {
            const handleContinueAsGuest = jest.fn();
            const component = mount(
                <TestComponent email={value} onContinueAsGuest={handleContinueAsGuest} />,
            );

            component.find('form').simulate('submit');

            await new Promise((resolve) => process.nextTick(resolve));

            component.update();

            return component.find('[data-test="email-field-error-message"]').text();
        }

        expect(getEmailError('')).resolves.toBe('Email address is required');

        const invalidEmailMessage = 'Email address must be valid';

        expect(getEmailError('test@bigcommerce')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('@test.test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@.test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@test.')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@te st.test')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@test.comtest@test.com')).resolves.toEqual(invalidEmailMessage);
        expect(getEmailError('test@test.com,test@test.com')).resolves.toEqual(invalidEmailMessage);
    });

    it('notifies when user clicks on "sign in" button', () => {
        const handleShowLogin = jest.fn();
        const component = mount(<TestComponent onShowLogin={handleShowLogin} />);

        component.find('[data-test="customer-continue-button"]').simulate('click');

        expect(handleShowLogin).toHaveBeenCalled();
    });

    it('calls "onChangeEmail" handler when user changes email address', () => {
        const handleChangeEmail = jest.fn();
        const component = mount(<TestComponent onChangeEmail={handleChangeEmail} />);

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce', name: 'email' } });

        expect(handleChangeEmail).toHaveBeenCalledWith('test@bigcommerce');
    });

    it('calls "onChangeEmail" handler when user changes email address with strict validation enabled and it includes a domain', () => {
        const handleChangeEmail = jest.fn();
        const component = mount(<TestComponent onChangeEmail={handleChangeEmail} />);

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        expect(handleChangeEmail).toHaveBeenCalledWith('test@bigcommerce.com');
    });

    it('renders newsletter field if store allows newsletter subscription', () => {
        const component = mount(<TestComponent canSubscribe={true} />);

        expect(component.find('label[htmlFor="shouldSubscribe"]').text()).toBe(
            'Subscribe to our newsletter.',
        );
        expect(component.exists('input[name="shouldSubscribe"]')).toBe(true);
    });

    it('renders marketing consent field', () => {
        const component = mount(
            <TestComponent canSubscribe={true} requiresMarketingConsent={true} />,
        );

        expect(component.find('label[htmlFor="shouldSubscribe"]').text()).toBe(
            'I would like to receive updates and offers.',
        );
        expect(component.exists('input[name="shouldSubscribe"]')).toBe(true);
    });

    it('sets newsletter field with default value', () => {
        const Container = ({ defaultShouldSubscribe }: { defaultShouldSubscribe: boolean }) => (
            <TestComponent canSubscribe={true} defaultShouldSubscribe={defaultShouldSubscribe} />
        );

        const componentA = mount(<Container defaultShouldSubscribe={true} />);
        const componentB = mount(<Container defaultShouldSubscribe={false} />);

        expect(componentA.find('input[name="shouldSubscribe"]').prop('value')).toBe(true);

        expect(componentB.find('input[name="shouldSubscribe"]').prop('value')).toBe(false);
    });

    it('renders privacy policy field', () => {
        const component = mount(<TestComponent privacyPolicyUrl="foo" />);

        expect(component.find(PrivacyPolicyField)).toHaveLength(1);
    });

    it('displays error message if privacy policy is required and not checked', async () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(
            <TestComponent onContinueAsGuest={handleContinueAsGuest} privacyPolicyUrl="foo" />,
        );

        component
            .find('input[name="email"]')
            .simulate('change', { target: { value: 'test@test.com', name: 'email' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(handleContinueAsGuest).not.toHaveBeenCalled();

        expect(component.find('[data-test="privacy-policy-field-error-message"]').text()).toBe(
            'Please agree to the Privacy Policy.',
        );
    });

    it('does not render "sign in" button when loading', () => {
        const component = mount(<TestComponent isLoading={true} />);

        expect(component.find('[data-test="customer-continue-button"]')).toHaveLength(0);
    });

    it('shows different action button label if another label id was provided', () => {
        const component = mount(<TestComponent continueAsGuestButtonLabelId="customer.continue" />);

        expect(component.find('[data-test="customer-continue-button"]').text()).not.toBe(
            'Continue as guest',
        );
    });
});
