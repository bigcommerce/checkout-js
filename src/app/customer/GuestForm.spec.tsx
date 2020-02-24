import { mount, render } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { PrivacyPolicyField } from '../privacyPolicy';

import GuestForm, { GuestFormProps } from './GuestForm';

describe('GuestForm', () => {
    let defaultProps: GuestFormProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            canSubscribe: true,
            defaultShouldSubscribe: false,
            isContinuingAsGuest: false,
            onChangeEmail: jest.fn(),
            onContinueAsGuest: jest.fn(),
            onShowLogin: jest.fn(),
            requiresMarketingConsent: false,
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot', () => {
        const component = render(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm { ...defaultProps } />
            </LocaleContext.Provider>
        );

        expect(component)
            .toMatchSnapshot();
    });

    it('renders form with initial values', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    defaultShouldSubscribe={ true }
                    email={ 'test@bigcommerce.com' }
                />
            </LocaleContext.Provider>
        );

        expect(component.find('input[name="email"]').prop('value'))
            .toEqual('test@bigcommerce.com');

        expect(component.find('input[name="shouldSubscribe"]').prop('value'))
            .toEqual(true);
    });

    it('notifies when user clicks on "continue as guest" button', async () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onContinueAsGuest={ handleContinueAsGuest }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('input[name="shouldSubscribe"]')
            .simulate('change', { target: { value: true, name: 'shouldSubscribe' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleContinueAsGuest)
            .toHaveBeenCalledWith({
                email: 'test@bigcommerce.com',
                privacyPolicy: false,
                shouldSubscribe: true,
            });
    });

    it('displays error message if email is not valid', async () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onContinueAsGuest={ handleContinueAsGuest }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        component.update();

        expect(handleContinueAsGuest)
            .not.toHaveBeenCalled();

        expect(component.find('[data-test="email-field-error-message"]').text())
            .toEqual('Email address must be valid');
    });

    it('displays error message if email does not have a domain and strict validation is enabled', async () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onContinueAsGuest={ handleContinueAsGuest }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        component.update();

        expect(handleContinueAsGuest)
            .not.toHaveBeenCalled();

        expect(component.find('[data-test="email-field-error-message"]').text())
            .toEqual('Email address must be valid');
    });

    it('notifies when user clicks on "sign in" button', () => {
        const handleShowLogin = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onShowLogin={ handleShowLogin }
                />
            </LocaleContext.Provider>
        );

        component.find('[data-test="customer-continue-button"]')
            .simulate('click');

        expect(handleShowLogin)
            .toHaveBeenCalled();
    });

    it('calls "onChangeEmail" handler when user changes email address', () => {
        const handleChangeEmail = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onChangeEmail={ handleChangeEmail }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce', name: 'email' } });

        expect(handleChangeEmail)
            .toHaveBeenCalledWith('test@bigcommerce');
    });

    it('calls "onChangeEmail" handler when user changes email address with strict validation enabled and it includes a domain', () => {
        const handleChangeEmail = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onChangeEmail={ handleChangeEmail }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        expect(handleChangeEmail)
            .toHaveBeenCalledWith('test@bigcommerce.com');
    });

    it('renders newsletter field if store allows newsletter subscription', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    canSubscribe={ true }
                />
            </LocaleContext.Provider>
        );

        expect(component.find('label[htmlFor="shouldSubscribe"]').text())
            .toEqual('Subscribe to our newsletter.');
        expect(component.exists('input[name="shouldSubscribe"]'))
            .toEqual(true);
    });

    it('renders marketing consent field', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    canSubscribe={ true }
                    requiresMarketingConsent={ true }
                />
            </LocaleContext.Provider>
        );

        expect(component.find('label[htmlFor="shouldSubscribe"]').text())
            .toEqual('I would like to receive updates and offers.');
        expect(component.exists('input[name="shouldSubscribe"]'))
            .toEqual(true);
    });

    it('sets newsletter field with default value', () => {
        const Container = ({ defaultShouldSubscribe }: { defaultShouldSubscribe: boolean }) => (
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    canSubscribe={ true }
                    defaultShouldSubscribe={ defaultShouldSubscribe }
                />
            </LocaleContext.Provider>
        );

        const componentA = mount(<Container defaultShouldSubscribe={ true } />);
        const componentB = mount(<Container defaultShouldSubscribe={ false } />);

        expect(componentA.find('input[name="shouldSubscribe"]').prop('value'))
            .toEqual(true);

        expect(componentB.find('input[name="shouldSubscribe"]').prop('value'))
            .toEqual(false);
    });

    it('renders privacy policy field', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    privacyPolicyUrl={ 'foo' }
                />
            </LocaleContext.Provider>
        );

        expect(component.find(PrivacyPolicyField)).toHaveLength(1);
    });

    it('displays error message if privacy policy is required and not checked', async () => {
        const handleContinueAsGuest = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <GuestForm
                    { ...defaultProps }
                    onContinueAsGuest={ handleContinueAsGuest }
                    privacyPolicyUrl={ 'foo' }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@test.com', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        component.update();

        expect(handleContinueAsGuest)
            .not.toHaveBeenCalled();

        expect(component.find('[data-test="privacy-policy-field-error-message"]').text())
            .toEqual('Please agree to the Privacy Policy.');
    });
});
