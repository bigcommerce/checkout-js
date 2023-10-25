import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { getCheckout, getCheckoutPayment } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { LoadingOverlay } from '../../ui/loading';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import SignOutLink, { SignOutLinkProps } from './SignOutLink';
import WalletButtonPaymentMethod, {
    WalletButtonPaymentMethodProps,
} from './WalletButtonPaymentMethod';

describe('WalletButtonPaymentMethod', () => {
    let WalletButtonPaymentMethodTest: FunctionComponent<WalletButtonPaymentMethodProps>;
    let defaultProps: WalletButtonPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;

    beforeEach(() => {
        defaultProps = {
            buttonId: 'button-container',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(getBillingAddress());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        WalletButtonPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <WalletButtonPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<WalletButtonPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('hides content while loading', () => {
        const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('hideContentWhenLoading')).toBe(true);
    });

    it('renders placeholder container with provided ID', () => {
        const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(component.exists(`#${defaultProps.buttonId}`)).toBe(true);
    });

    it('renders button for user to sign into their wallet', () => {
        const component = mount(
            <WalletButtonPaymentMethodTest
                {...defaultProps}
                signInButtonClassName="wallet-button"
                signInButtonLabel="Sign into wallet"
            />,
        );

        expect(component.exists(`#${defaultProps.buttonId}`)).toBe(true);

        expect(component.find(`#${defaultProps.buttonId}`).text()).toBe('Sign into wallet');

        expect(component.find(`#${defaultProps.buttonId}`).prop('className')).toContain(
            'wallet-button',
        );
    });

    it('does not render sign out link', () => {
        const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(component.find(SignOutLink)).toHaveLength(0);
    });

    it('disables submit button', () => {
        mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(paymentContext.disableSubmit).toHaveBeenCalledWith(defaultProps.method, true);
    });

    it('enables submit button if payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(paymentContext.disableSubmit).toHaveBeenCalledWith(defaultProps.method, false);
    });

    describe('when user is signed into their payment method account and credit card is selected from their wallet', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                payments: [{ ...getCheckoutPayment(), providerId: defaultProps.method.id }],
            });

            defaultProps = merge({}, defaultProps, {
                method: {
                    initializationData: {
                        cardData: {
                            accountMask: '1111',
                            cardType: 'Visa',
                            expMonth: '10',
                            expYear: '22',
                        },
                    },
                },
            });
        });

        it('renders sign out link', () => {
            const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

            expect(component.find(SignOutLink)).toHaveLength(1);
        });

        it('enables submit button', () => {
            mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

            expect(paymentContext.disableSubmit).toHaveBeenCalledWith(defaultProps.method, false);
        });

        it('displays information of selected credit card', () => {
            const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

            expect(
                component.find('[data-test="payment-method-wallet-card-name"]').text(),
            ).toContain('Test Tester');

            expect(
                component.find('[data-test="payment-method-wallet-card-type"]').text(),
            ).toContain('Visa: **** 1111');

            expect(
                component.find('[data-test="payment-method-wallet-card-expiry"]').text(),
            ).toContain('10/22');
        });

        it('displays card information in `accountNum` format', () => {
            const method = {
                ...defaultProps.method,
                initializationData: {
                    accountMask: '1111',
                    accountNum: '4111',
                    expDate: '1022',
                },
            };

            const component = mount(
                <WalletButtonPaymentMethodTest {...defaultProps} method={method} />,
            );

            expect(
                component.find('[data-test="payment-method-wallet-card-type"]').text(),
            ).toContain('Visa: **** 1111');

            expect(
                component.find('[data-test="payment-method-wallet-card-expiry"]').text(),
            ).toContain('10/22');
        });

        it('displays card information in `card_information` format', () => {
            const method = {
                ...defaultProps.method,
                initializationData: {
                    card_information: {
                        number: '1111',
                        type: 'Visa',
                    },
                },
            };

            const component = mount(
                <WalletButtonPaymentMethodTest {...defaultProps} method={method} />,
            );

            expect(
                component.find('[data-test="payment-method-wallet-card-type"]').text(),
            ).toContain('Visa: **** 1111');
        });

        it('renders button for user to edit their selected credit card', () => {
            const component = mount(
                <WalletButtonPaymentMethodTest
                    {...defaultProps}
                    editButtonLabel="Edit card"
                    shouldShowEditButton
                />,
            );

            expect(component.exists(`#${defaultProps.buttonId}`)).toBe(true);

            expect(component.find(`#${defaultProps.buttonId}`).text()).toBe('Edit card');
        });

        it('does not render button for user to edit their selected card if not configured', () => {
            const component = mount(<WalletButtonPaymentMethodTest {...defaultProps} />);

            expect(component.exists(`#${defaultProps.buttonId}`)).toBe(false);
        });

        it('signs out from payment method account of user when clicking on sign out link', async () => {
            const handleSignOutError = jest.fn();

            jest.spyOn(checkoutService, 'signOutCustomer').mockResolvedValue(checkoutState);

            const component = mount(
                <WalletButtonPaymentMethodTest
                    {...defaultProps}
                    onSignOutError={handleSignOutError}
                />,
            );

            (component.find(SignOutLink) as ReactWrapper<SignOutLinkProps>).prop('onSignOut')();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.signOutCustomer).toHaveBeenCalledWith({
                methodId: defaultProps.method.id,
            });

            expect(handleSignOutError).not.toHaveBeenCalled();
        });

        it('notifies parent component if unable to sign out', async () => {
            const handleSignOutError = jest.fn();

            jest.spyOn(checkoutService, 'signOutCustomer').mockRejectedValue(
                new Error('Unknown error'),
            );

            const component = mount(
                <WalletButtonPaymentMethodTest
                    {...defaultProps}
                    onSignOutError={handleSignOutError}
                />,
            );

            (component.find(SignOutLink) as ReactWrapper<SignOutLinkProps>).prop('onSignOut')();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignOutError).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
