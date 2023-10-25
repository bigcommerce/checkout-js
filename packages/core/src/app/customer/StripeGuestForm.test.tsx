import React, { FunctionComponent } from 'react';

import { fireEvent, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import CheckoutStepType from '../checkout/CheckoutStepType';

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
            step: {
                isActive: true,
                isComplete: false,
                isEditable: false,
                isRequired: true,
                type: CheckoutStepType.Customer
            },
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
                {...defaultProps}
                {...props}
            />
        );
    });

    it('matches snapshot', () => {
        const view = render(<TestComponent />);

        expect(view).toMatchSnapshot();
    });

    it('disables "continue as guest" button when isLoading is true', () => {
        render(
            <TestComponent
                isLoading={true}
                onContinueAsGuest={jest.fn()}
            />
        );
        const button = screen.getByTestId('stripe-customer-continue-as-guest-button');

        expect(button).toBeDisabled();
    });

    it('executes a function when the button is clicked', async () => {
        const handleContinueAsGuest = jest.fn();

        render(<TestComponent onContinueAsGuest={handleContinueAsGuest} privacyPolicyUrl="foo" />);

        const privacyCheckbox = screen.getByTestId('privacy-policy-checkbox');
        fireEvent.click(privacyCheckbox);

        const subscribeCheckbox = screen.getByTestId('should-subscribe-checkbox');
        fireEvent.click(subscribeCheckbox);

        const button = screen.getByTestId('stripe-customer-continue-as-guest-button');
        fireEvent.submit(button);

        await new Promise((resolve) => process.nextTick(resolve));

        await waitFor(() => {
            expect(handleContinueAsGuest).toHaveBeenCalledWith({
                "email": "",
                "shouldSubscribe": true
            });
        })
    });

    it('initializes stripeGuestForm when component mounts', () => {
        defaultProps.initialize = jest.fn((options: any) => {
            options.stripeupe.onEmailChange('cosmefulanito@cosme.mx', true);
            options.stripeupe.isLoading(true);
            options.stripeupe?.getStyles();
        })
        render(<TestComponent {...defaultProps} />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('deinitializes stripeGuestForm when component mounts', () => {
        const view = render(<TestComponent {...defaultProps} />);

        view.unmount();

        expect(defaultProps.deinitialize).toHaveBeenCalled();
    });

    it('renders form with initial values', () => {
        render(
            <TestComponent
                defaultShouldSubscribe={true}
                email="test@bigcommerce.com"
            />
        );

        expect(screen.getByTestId('should-subscribe-checkbox')).toBeChecked();
    });

    it('notifies when user clicks on "sign in" button', () => {
        const handleShowLogin = jest.fn();
        render(
            <TestComponent
                onShowLogin={handleShowLogin}
            />
        );

        const customerContinueButton = screen.getByTestId('customer-continue-button');
        fireEvent.click(customerContinueButton);

        expect(handleShowLogin).toHaveBeenCalled();
    });

    it('renders newsletter field if store allows newsletter subscription', () => {
        render(
            <TestComponent
                canSubscribe={true}
            />
        );

        expect(screen.getByTestId('should-subscribe-checkbox')).toBeInTheDocument();
    });

    it('renders marketing consent field', () => {
        render(
            <TestComponent
                canSubscribe={true}
                requiresMarketingConsent={true}
            />
        );

        expect(screen.getByTestId('should-subscribe-checkbox')).toBeInTheDocument();
    });

    it('sets newsletter field with default value false', () => {
        render(<TestComponent canSubscribe={true} defaultShouldSubscribe={false} />);
        const shouldSubscribeCheckbox = screen.getByTestId('should-subscribe-checkbox');
        expect((shouldSubscribeCheckbox as HTMLOptionElement).value).toBe('false');
    });

    it('sets newsletter field with default value true', () => {
        render(<TestComponent canSubscribe={true} defaultShouldSubscribe={true} />);
        const shouldSubscribeCheckbox = screen.getByTestId('should-subscribe-checkbox');
        expect((shouldSubscribeCheckbox as HTMLOptionElement).value).toBe('true');
    });

    it('renders privacy policy field', () => {
        render(
            <TestComponent
                privacyPolicyUrl="foo"
            />
        );

        expect(screen.getByTestId('privacy-policy-checkbox')).toBeInTheDocument();
    });

    it('does not render "sign in" button when loading', () => {
        render(
            <TestComponent
                isLoading={true}
            />
        );

        expect(screen.queryByTestId('customer-continue-button')).not.toBeInTheDocument();
    });

    it('shows different action button label if another label id was provided', () => {
        render(
            <TestComponent
                continueAsGuestButtonLabelId="customer.continue"
            />
        );

        expect(screen.getByTestId('customer-continue-button')).not.toHaveTextContent('Continue as guest');
    });
});
