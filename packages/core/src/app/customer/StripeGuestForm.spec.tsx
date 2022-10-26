import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import CheckoutStepType from '../checkout/CheckoutStepType';
import { PrivacyPolicyField } from '../privacyPolicy';

import StripeGuestForm, { StripeGuestFormProps } from './StripeGuestForm';

describe('StripeGuestForm', () => {
    let defaultProps: StripeGuestFormProps;
    let TestComponent: FunctionComponent<Partial<StripeGuestFormProps>>;
    const handleContinueAsGuest = jest.fn();
    const dummyElement = document.createElement('div');

    beforeEach(() => {
        defaultProps = {
            canSubscribe: true,
            continueAsGuestButtonLabelId: 'customer.continue_as_guest_action',
            defaultShouldSubscribe: false,
            isLoading: false,
            onChangeEmail: jest.fn(),
            onContinueAsGuest: handleContinueAsGuest,
            deinitialize: jest.fn(),
            updateStripeLinkAuthenticated: jest.fn(),
            initialize: jest.fn(),
            onShowLogin: jest.fn(),
            requiresMarketingConsent: false,
            step: { isActive: true,
                isComplete: false,
                isEditable: false,
                isRequired: true,
                type: CheckoutStepType.Customer },
        };

        jest.mock('../common/dom', () => ({
            getAppliedStyles: () => {
                return { color: '#cccccc' };
            },
        }));
        jest.spyOn(document, 'getElementById')
            .mockReturnValue(dummyElement);

        TestComponent = props => (
            <StripeGuestForm
                { ...defaultProps }
                { ...props }
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
        const component = mount(<TestComponent />);

        const button = component.find('button');
        const onClickEvent = button.prop('onClick');

        if (onClickEvent) {
            onClickEvent(new MouseEvent('click') as any);
        }

        expect(handleContinueAsGuest).toHaveBeenCalled();
    });

    it('initializes stripeGuestForm when component mounts', () => {
        defaultProps.initialize = jest.fn((options:any) => {
            options.stripeupe.onEmailChange('cosmefulanito@cosme.mx', true);
            options.stripeupe.isLoading(true);
            options.stripeupe?.getStyles();
        })
        mount(<TestComponent { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('deinitializes stripeGuestForm when component mounts', () => {
        const component = mount(<TestComponent { ...defaultProps } />);

        component.unmount();

        expect(defaultProps.deinitialize).toHaveBeenCalled();
    });

    it('renders form with initial values', () => {
        const component = mount(
            <TestComponent
                defaultShouldSubscribe={ true }
                email="test@bigcommerce.com"
            />
        );

        expect(component.find('input[name="shouldSubscribe"]').prop('value'))
            .toBe(true);
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
            .toBe(true);
    });

    it('renders marketing consent field', () => {
        const component = mount(
            <TestComponent
                canSubscribe={ true }
                requiresMarketingConsent={ true }
            />
        );

        expect(component.exists('input[name="shouldSubscribe"]'))
            .toBe(true);
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
            .toBe(true);

        expect(componentB.find('input[name="shouldSubscribe"]').prop('value'))
            .toBe(false);
    });

    it('renders privacy policy field', () => {
        const component = mount(
            <TestComponent
                privacyPolicyUrl="foo"
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

        expect(component.find('[data-test="customer-continue-button"]')).toHaveLength(0);
    });

    it('shows different action button label if another label id was provided', () => {
        const component = mount(
            <TestComponent
                continueAsGuestButtonLabelId="customer.continue"
            />
        );

        expect(component.find('[data-test="customer-continue-button"]').text()).not.toBe('Continue as guest');
    });
});
