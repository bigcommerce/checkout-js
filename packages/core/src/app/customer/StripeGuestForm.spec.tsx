import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { PrivacyPolicyField } from '../privacyPolicy';

import StripeGuestForm, { StripeGuestFormProps } from './StripeGuestForm';

describe('StripeGuestForm', () => {
    let defaultProps: StripeGuestFormProps;
    let TestComponent: FunctionComponent<Partial<StripeGuestFormProps>>;
    const handleContinueAsGuest = jest.fn();
    const handleInitialize = jest.fn();
    const handleDeinitialize = jest.fn();

    beforeEach(() => {
        defaultProps = {
            canSubscribe: true,
            continueAsGuestButtonLabelId: 'customer.continue_as_guest_action',
            defaultShouldSubscribe: false,
            isLoading: false,
            onChangeEmail: jest.fn(),
            onContinueAsGuest: handleContinueAsGuest,
            deinitialize: handleDeinitialize(),
            initialize: handleInitialize(),
            onShowLogin: jest.fn(),
            requiresMarketingConsent: false,
        };

        TestComponent = props => (
            <StripeGuestForm
                { ...defaultProps }
                { ...props }
                deinitialize={ noop }
                initialize={ noop }
            />
        );
    });

    it('matches snapshot', () => {
        const component = render(<TestComponent />);

        expect(component).toMatchSnapshot();
    });

    it('disables "continue as guest" button when isLoading is true', () => {
        const component = mount(
            <TestComponent
                isLoading={ true }
                onContinueAsGuest={ jest.fn() }
            />
        );
        const button = component.find('[data-test="stripe-customer-continue-as-guest-button"]');

        expect(button.prop('disabled')).toBeTruthy();
    });

    it('executes a function when on click action is triggered', () => {
        const component = mount(
            <TestComponent />
        );

        const button = component.find('button');
        const onClickEvent = button.prop('onClick');

        if (onClickEvent) {
            onClickEvent(new MouseEvent('click') as any);
        }

        expect(handleContinueAsGuest).toHaveBeenCalled();
    });

    it('initializes stripeGuestForm when component mounts', () => {
        mount(<TestComponent { ...defaultProps } />);

        expect(handleInitialize).toHaveBeenCalled();
    });

    it('deinitializes stripeGuestForm when component mounts', () => {
        const component = mount(<TestComponent { ...defaultProps } />);
        component.unmount();

        expect(handleDeinitialize)
            .toHaveBeenCalled();
    });

    it('renders form with initial values', () => {
        const component = mount(
            <TestComponent
                defaultShouldSubscribe={ true }
                email={ 'test@bigcommerce.com' }
            />
        );

        expect(component.find('input[name="shouldSubscribe"]').prop('value'))
            .toEqual(true);
    });

    it('notifies when user clicks on "sign in" button', () => {
        const handleShowLogin = jest.fn();
        const component = mount(
            <TestComponent
                onShowLogin={ handleShowLogin }
            />
        );

        component.find('[data-test="customer-continue-button"]')
            .simulate('click');

        expect(handleShowLogin)
            .toHaveBeenCalled();
    });

    it('renders newsletter field if store allows newsletter subscription', () => {
        const component = mount(
            <TestComponent
                canSubscribe={ true }
            />
        );

        expect(component.exists('input[name="shouldSubscribe"]'))
            .toEqual(true);
    });

    it('renders marketing consent field', () => {
        const component = mount(
            <TestComponent
                canSubscribe={ true }
                requiresMarketingConsent={ true }
            />
        );

        expect(component.exists('input[name="shouldSubscribe"]'))
            .toEqual(true);
    });

    it('sets newsletter field with default value', () => {
        const Container = ({ defaultShouldSubscribe }: { defaultShouldSubscribe: boolean }) => (
            <TestComponent
                canSubscribe={ true }
                defaultShouldSubscribe={ defaultShouldSubscribe }
            />
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
            <TestComponent
                privacyPolicyUrl={ 'foo' }
            />
        );

        expect(component.find(PrivacyPolicyField)).toHaveLength(1);
    });

    it('does not render "sign in" button when loading', () => {
        const component = mount(
            <TestComponent
                isLoading={ true }
            />
        );

        expect(component.find('[data-test="customer-continue-button"]').length).toEqual(0);
    });

    it('shows different action button label if another label id was provided', () => {
        const component = mount(
            <TestComponent
                continueAsGuestButtonLabelId="customer.continue"
            />
        );

        expect(component.find('[data-test="customer-continue-button"]').text()).not.toEqual('Continue as guest');
    });
});
