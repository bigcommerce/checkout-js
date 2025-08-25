import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    getPaymentMethodName,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getAddress,
    getCheckout,
    getCheckoutPayment,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import WalletButtonPaymentMethodComponent, {
    type WalletButtonPaymentMethodProps,
} from './WalletButtonPaymentMethodComponent';

describe('WalletButtonPaymentMethod', () => {
    let WalletButtonPaymentMethodTest: FunctionComponent<WalletButtonPaymentMethodProps>;
    let defaultProps: WalletButtonPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let paymentForm: PaymentFormService;
    let billingAddress;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentForm = getPaymentFormServiceMock();
        billingAddress = {
            ...getAddress(),
            id: '1113412341',
        };
        defaultProps = {
            signOutCustomer: checkoutService.signOutCustomer,
            paymentForm,
            buttonId: 'button-container',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        WalletButtonPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <WalletButtonPaymentMethodComponent {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes payment method when component mounts', () => {
        render(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
    });

    it('catches error during component initialization', async () => {
        render(
            <WalletButtonPaymentMethodTest
                {...defaultProps}
                initializePayment={() => Promise.reject(new Error('test error'))}
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const { unmount } = render(<WalletButtonPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('catches error during component unmount', async () => {
        const { unmount } = render(
            <WalletButtonPaymentMethodTest
                {...defaultProps}
                deinitializePayment={() => Promise.reject(new Error('test error'))}
            />,
        );

        unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('renders loading overlay and hides conten while waiting for method to initialize', () => {
        const { unmount } = render(
            <WalletButtonPaymentMethodTest {...defaultProps} isInitializing />,
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
        unmount();
        render(<WalletButtonPaymentMethodTest {...defaultProps} isInitializing={false} />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders placeholder container with Sign In text', () => {
        render(<WalletButtonPaymentMethodTest {...defaultProps} />);
        expect(
            screen.getByText(
                localeContext.language.translate('remote.sign_in_action', {
                    providerName: getPaymentMethodName(localeContext.language)(defaultProps.method),
                }),
            ),
        ).toBeInTheDocument();
    });

    it('renders button for user to sign into their wallet', () => {
        render(
            <WalletButtonPaymentMethodTest
                {...defaultProps}
                signInButtonClassName="wallet-button"
                signInButtonLabel="Sign into wallet"
            />,
        );

        const element = screen.getByText('Sign into wallet');

        expect(element).toBeInTheDocument();
        expect(element).toHaveClass('wallet-button');
    });

    it('does not render sign out link', () => {
        render(<WalletButtonPaymentMethodTest {...defaultProps} />);
        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });

    it('disables submit button', () => {
        render(<WalletButtonPaymentMethodTest {...defaultProps} />);

        const {
            paymentForm: { disableSubmit },
        } = defaultProps;

        expect(disableSubmit).toHaveBeenCalledWith(defaultProps.method, true);
    });

    it('enables submit button if payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        render(<WalletButtonPaymentMethodTest {...defaultProps} />);

        const {
            paymentForm: { disableSubmit },
        } = defaultProps;

        expect(disableSubmit).toHaveBeenCalledWith(defaultProps.method, false);
    });

    it('toggles submit button if payment data become required', () => {
        const { rerender } = render(<WalletButtonPaymentMethodTest {...defaultProps} />);

        const {
            paymentForm: { disableSubmit },
        } = defaultProps;

        expect(disableSubmit).toHaveBeenCalledWith(defaultProps.method, true);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        rerender(<WalletButtonPaymentMethodTest {...defaultProps} />);
        expect(disableSubmit).toHaveBeenCalledWith(defaultProps.method, false);
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
            render(<WalletButtonPaymentMethodTest {...defaultProps} />);

            const linkText = localeContext.language.translate('remote.sign_out_action', {
                providerName: getPaymentMethodName(localeContext.language)(defaultProps.method),
            });

            expect(screen.getByText(linkText)).toBeInTheDocument();
        });

        it('enables submit button', () => {
            render(<WalletButtonPaymentMethodTest {...defaultProps} />);

            const {
                paymentForm: { disableSubmit },
            } = defaultProps;

            expect(disableSubmit).toHaveBeenCalledWith(defaultProps.method, false);
        });

        it('displays information of selected credit card', () => {
            render(<WalletButtonPaymentMethodTest {...defaultProps} />);

            expect(screen.getByTestId('payment-method-wallet-card-name')).toHaveTextContent(
                'Test Tester',
            );
            expect(screen.getByTestId('payment-method-wallet-card-type')).toHaveTextContent(
                'Visa: **** 1111',
            );
            expect(screen.getByTestId('payment-method-wallet-card-expiry')).toHaveTextContent(
                '10/22',
            );
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

            render(<WalletButtonPaymentMethodTest {...defaultProps} method={method} />);

            expect(screen.getByTestId('payment-method-wallet-card-type')).toHaveTextContent(
                'Visa: **** 1111',
            );

            expect(screen.getByTestId('payment-method-wallet-card-expiry')).toHaveTextContent(
                '10/22',
            );
        });

        it('displays card information in `card_information` format', () => {
            const method = {
                ...defaultProps.method,
                initializationData: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    card_information: {
                        number: '1111',
                        type: 'Visa',
                    },
                },
            };

            render(<WalletButtonPaymentMethodTest {...defaultProps} method={method} />);

            expect(screen.getByTestId('payment-method-wallet-card-type')).toHaveTextContent(
                'Visa: **** 1111',
            );
        });

        it('renders button for user to edit their selected credit card', () => {
            const editButtonLabel = 'Edit card';

            render(
                <WalletButtonPaymentMethodTest
                    {...defaultProps}
                    editButtonLabel={editButtonLabel}
                    shouldShowEditButton
                />,
            );
            expect(
                screen.queryByText(
                    localeContext.language.translate('remote.select_different_card_action'),
                ),
            ).not.toBeInTheDocument();
            expect(screen.getByText(editButtonLabel)).toBeInTheDocument();
        });

        it('does not render button for user to edit their selected card if not configured', () => {
            render(<WalletButtonPaymentMethodTest {...defaultProps} />);

            expect(
                screen.queryByText(
                    localeContext.language.translate('remote.select_different_card_action'),
                ),
            ).not.toBeInTheDocument();
        });

        it('signs out from payment method account of user when clicking on sign out link', async () => {
            const handleSignOutError = jest.fn();

            jest.spyOn(defaultProps, 'signOutCustomer').mockResolvedValue(checkoutState);

            render(
                <WalletButtonPaymentMethodTest
                    {...defaultProps}
                    onSignOutError={handleSignOutError}
                />,
            );

            const actionButton = screen.getByText(
                localeContext.language.translate('remote.sign_out_action', {
                    providerName: getPaymentMethodName(localeContext.language)(defaultProps.method),
                }),
            );

            fireEvent.click(actionButton);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(defaultProps.signOutCustomer).toHaveBeenCalledWith({
                methodId: defaultProps.method.id,
            });

            expect(handleSignOutError).not.toHaveBeenCalled();
        });

        it('notifies parent component if unable to sign out', async () => {
            const handleSignOutError = jest.fn();

            jest.spyOn(defaultProps, 'signOutCustomer').mockRejectedValue(
                new Error('Unknown error'),
            );

            render(
                <WalletButtonPaymentMethodTest
                    {...defaultProps}
                    onSignOutError={handleSignOutError}
                />,
            );

            const actionButton = screen.getByText(
                localeContext.language.translate('remote.sign_out_action', {
                    providerName: getPaymentMethodName(localeContext.language)(defaultProps.method),
                }),
            );

            fireEvent.click(actionButton);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignOutError).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
