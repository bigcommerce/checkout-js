import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import HostedPaymentMethod, { type HostedPaymentComponentProps } from './HostedPaymentComponent';

describe('HostedPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: HostedPaymentComponentProps;
    let HostedPaymentMethodTest: FunctionComponent<HostedPaymentComponentProps>;
    let localeContext: LocaleContextType;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentForm = getPaymentFormServiceMock();

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        defaultProps = {
            checkoutService,
            checkoutState,
            language: localeContext.language,
            method: getPaymentMethod(),
            paymentForm,
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        HostedPaymentMethodTest = (props) => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <HostedPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    it('initializes payment method when component mounts', () => {
        render(<HostedPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
    });

    it('does not render fields and deinitializes payment method when component unmounts', () => {
        const { unmount, container } = render(<HostedPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();
        unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onUnhandledError if deinitialize was failed', () => {
        defaultProps.deinitializePayment = jest.fn(() => {
            throw new Error();
        });

        const { unmount } = render(<HostedPaymentMethodTest {...defaultProps} />);

        unmount();

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('shows loading overlay while waiting for method to initialize if description is provided', () => {
        const { unmount } = render(
            <HostedPaymentMethodTest {...defaultProps} description="Hello world" isInitializing />,
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();

        unmount();
        render(<HostedPaymentMethodTest {...defaultProps} isInitializing={false} />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not show loading overlay if there is no description', () => {
        render(<HostedPaymentMethodTest {...defaultProps} isInitializing />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            defaultProps.method.config.isVaultingEnabled = true;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        });

        it('shows stored instruments when component mounts', async () => {
            render(<HostedPaymentMethodTest {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.loadInstruments).toHaveBeenCalled();
            expect(screen.getByTestId('account-instrument-select')).toBeInTheDocument();
        });

        it('shows instruments fieldset when there is at least one stored instrument', () => {
            render(<HostedPaymentMethodTest {...defaultProps} />);
            expect(screen.getByText('Stored accounts')).toBeInTheDocument();
            expect(screen.getByTestId('instrument-select-note')).toBeInTheDocument();
        });

        it('shows the instrument fieldset when there are instruments, but no trusted stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(
                getInstruments().map((instrument) => ({
                    ...instrument,
                    trustedShippingAddress: false,
                })),
            );

            render(<HostedPaymentMethodTest {...defaultProps} />);

            expect(screen.getByText('Stored accounts')).toBeInTheDocument();
            expect(screen.getByTestId('instrument-select-note')).toBeInTheDocument();
        });

        it('shows the instrument fieldset and stored instrument when there is a trusted store instrument', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(
                getInstruments().map((instrument) => ({
                    ...instrument,
                    trustedShippingAddress: true,
                })),
            );

            render(<HostedPaymentMethodTest {...defaultProps} />);

            expect(screen.getByText('Stored accounts')).toBeInTheDocument();
            expect(screen.getByTestId('instrument-select-externalId')).toBeInTheDocument();
            expect(screen.getByTestId('account-instrument-fieldset')).toBeInTheDocument();
            expect(screen.getByText('test@external-id.com')).toBeInTheDocument();
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<HostedPaymentMethodTest {...defaultProps} />);
            expect(screen.queryByTestId('account-instrument-fieldset')).not.toBeInTheDocument();
            expect(screen.queryByText('test@external-id.com')).not.toBeInTheDocument();
        });

        it('shows a message when no saved instruments', async () => {
            render(<HostedPaymentMethodTest {...defaultProps} />);
            await userEvent.click(screen.getByText('Manage'));

            expect(
                screen.getByText('You do not have any stored payment methods.'),
            ).toBeInTheDocument();
        });

        it('does not show instruments fieldset when user is starting from the cart', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataSubmitted').mockReturnValue(true);

            render(<HostedPaymentMethodTest {...defaultProps} />);

            expect(screen.queryByTestId('account-instrument-fieldset')).not.toBeInTheDocument();
        });

        it('shows save account checkbox when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<HostedPaymentMethodTest {...defaultProps} />);
            expect(
                screen.getByText('Save this account for future transactions'),
            ).toBeInTheDocument();
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            render(<HostedPaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });
    });

    describe('no cart data available', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(undefined);
        });

        it('throws an error if cart data is not available in state', () => {
            expect(() => render(<HostedPaymentMethodTest {...defaultProps} />)).toThrow(Error);
        });
    });
});
