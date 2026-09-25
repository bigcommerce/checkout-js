import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type HostedInstrument,
    type LanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
    PaymentFormContext,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCustomer,
    getGuestCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import googlePayIntegrations from './googlePayIntegrations';
import GooglePayPaymentMethodComponent from './GooglePayPaymentMethodComponent';

describe('GooglePayPaymentMethodComponent', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;
    let onUnhandledError: jest.Mock;

    const method = {
        ...getPaymentMethod(),
        id: 'googlepaybraintree',
        gateway: 'braintree',
    };

    const buildProps = (overrides: Partial<{ paymentForm: PaymentFormService }> = {}) => ({
        checkoutService,
        checkoutState,
        language: { translate: jest.fn() } as unknown as LanguageService,
        method,
        onUnhandledError,
        paymentForm,
        ...overrides,
    });

    const renderComponent = (overrides: Partial<{ paymentForm: PaymentFormService }> = {}) =>
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <GooglePayPaymentMethodComponent {...buildProps(overrides)} />
            </CheckoutProvider>,
        );

    beforeEach(() => {
        jest.useFakeTimers();

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();
        onUnhandledError = jest.fn();

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        (paymentForm.getFormValues as jest.Mock).mockReturnValue({ terms: false });
        (paymentForm.validateForm as jest.Mock).mockResolvedValue({
            terms: 'terms_and_conditions.agreement_required_error',
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('hides the Place Order button on mount', () => {
        renderComponent();

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(method, true);
    });

    it('does not call initializePayment before the DOM has updated', () => {
        renderComponent();

        expect(checkoutService.initializePayment).not.toHaveBeenCalled();
    });

    it('calls initializePayment with container options after setTimeout(0)', () => {
        renderComponent();

        jest.runAllTimers();

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                integrations: googlePayIntegrations,
                [method.id]: {
                    container: 'checkout-payment-continue',
                    buttonColor: 'default',
                    buttonSizeMode: 'fill',
                    buttonType: 'pay',
                    loadingContainerId: 'checkout-app',
                    onError: expect.any(Function),
                    getFieldsValues: expect.any(Function),
                },
            }),
        );
    });

    it('passes onUnhandledError as the onError callback', () => {
        renderComponent();

        jest.runAllTimers();

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((call as Record<string, any>)[method.id].onError).toBe(onUnhandledError);
    });

    it('renders null — no visible DOM output', () => {
        const { container } = renderComponent();

        expect(container).toBeEmptyDOMElement();
    });

    it('restores the Place Order button on unmount', () => {
        const { unmount } = renderComponent();

        unmount();

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(method, false);
    });

    it('deinitializes payment on unmount', () => {
        const { unmount } = renderComponent();

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: method.id,
            gatewayId: method.gateway,
        });
    });

    it('cancels pending initializePayment when unmounting before setTimeout fires', () => {
        const { unmount } = renderComponent();

        unmount();

        jest.runAllTimers();

        expect(checkoutService.initializePayment).not.toHaveBeenCalled();
    });

    it('calls onUnhandledError when initializePayment rejects', async () => {
        const error = new Error('initialization failed');

        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(error);

        renderComponent();

        jest.runAllTimers();

        await Promise.resolve();

        expect(onUnhandledError).toHaveBeenCalledWith(error);
    });

    it('does not call onUnhandledError for non-Error rejections', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue('string rejection');

        renderComponent();

        jest.runAllTimers();

        await Promise.resolve();

        expect(onUnhandledError).not.toHaveBeenCalled();
    });

    describe('Terms and conditions guard', () => {
        let googlePayContainer: HTMLDivElement;
        let googlePayButton: HTMLButtonElement;

        const storeConfigWithTermsRequired = {
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                enableTermsAndConditions: true,
            },
        };

        const fireClickOn = (target: HTMLElement) => {
            const event = new MouseEvent('click', { bubbles: true, cancelable: true });

            jest.spyOn(event, 'stopPropagation');
            jest.spyOn(event, 'preventDefault');
            target.dispatchEvent(event);

            return event;
        };

        beforeEach(() => {
            googlePayContainer = document.createElement('div');
            googlePayContainer.id = 'checkout-payment-continue';
            googlePayButton = document.createElement('button');
            googlePayContainer.appendChild(googlePayButton);
            document.body.appendChild(googlePayContainer);
        });

        afterEach(() => {
            document.body.removeChild(googlePayContainer);
        });

        it('does not block the click when T&C is not required', () => {
            renderComponent();

            const event = fireClickOn(googlePayButton);

            expect(event.stopPropagation).not.toHaveBeenCalled();
            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(paymentForm.setSubmitted).not.toHaveBeenCalled();
            expect(paymentForm.setFieldTouched).not.toHaveBeenCalled();
        });

        it('blocks the click when T&C is required and unchecked', async () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithTermsRequired,
            );
            (paymentForm.getFormValues as jest.Mock).mockReturnValue({ terms: false });

            renderComponent();

            const event = fireClickOn(googlePayButton);

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();

            await Promise.resolve();

            expect(paymentForm.validateForm).toHaveBeenCalled();
            expect(paymentForm.setSubmitted).toHaveBeenCalledWith(true);
            expect(paymentForm.setFieldTouched).toHaveBeenCalledWith('terms', true);
        });

        it('does not block the click when T&C is required and the checkbox is checked', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithTermsRequired,
            );
            (paymentForm.getFormValues as jest.Mock).mockReturnValue({ terms: true });

            renderComponent();

            const event = fireClickOn(googlePayButton);

            expect(event.stopPropagation).not.toHaveBeenCalled();
            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(paymentForm.setSubmitted).not.toHaveBeenCalled();
        });

        it('reads the current paymentForm after re-renders', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithTermsRequired,
            );
            (paymentForm.getFormValues as jest.Mock).mockReturnValue({ terms: false });

            const { rerender } = renderComponent();

            // Simulate the user ticking the checkbox
            const updatedPaymentForm = getPaymentFormServiceMock();

            updatedPaymentForm.getFormValues.mockReturnValue({ terms: true });

            rerender(
                <CheckoutProvider checkoutService={checkoutService}>
                    <GooglePayPaymentMethodComponent
                        {...buildProps({ paymentForm: updatedPaymentForm })}
                    />
                </CheckoutProvider>,
            );

            const event = fireClickOn(googlePayButton);

            expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        it('removes the document click listener on unmount', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithTermsRequired,
            );
            (paymentForm.getFormValues as jest.Mock).mockReturnValue({ terms: false });

            const { unmount } = renderComponent();

            unmount();

            const event = fireClickOn(googlePayButton);

            expect(event.stopPropagation).not.toHaveBeenCalled();
        });

        it('does not update payment form after unmount when validateForm is pending', async () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithTermsRequired,
            );
            (paymentForm.getFormValues as jest.Mock).mockReturnValue({ terms: false });

            let resolveValidateForm: (errors: { terms?: string }) => void;

            (paymentForm.validateForm as jest.Mock).mockReturnValue(
                new Promise((resolve) => {
                    resolveValidateForm = resolve;
                }),
            );

            const { unmount } = renderComponent();

            fireClickOn(googlePayButton);

            expect(paymentForm.validateForm).toHaveBeenCalled();
            expect(paymentForm.setSubmitted).not.toHaveBeenCalled();

            unmount();

            resolveValidateForm!({
                terms: 'terms_and_conditions.agreement_required_error',
            });

            await Promise.resolve();

            expect(paymentForm.setSubmitted).not.toHaveBeenCalled();
            expect(paymentForm.setFieldTouched).not.toHaveBeenCalled();
        });
    });
    describe('save payment method checkbox', () => {
        const SAVE_LABEL = 'Save this card for future transactions';

        let localeContext: LocaleContextType;
        let vaultingMethod: PaymentMethod;

        const renderWithForm = (methodOverride: PaymentMethod = vaultingMethod) =>
            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <LocaleContext.Provider value={localeContext}>
                            <Formik initialValues={{}} onSubmit={noop}>
                                <GooglePayPaymentMethodComponent
                                    {...buildProps()}
                                    method={methodOverride}
                                />
                            </Formik>
                        </LocaleContext.Provider>
                    </PaymentFormContext.Provider>
                </CheckoutProvider>,
            );

        beforeEach(() => {
            localeContext = createLocaleContext(getStoreConfig());

            vaultingMethod = {
                ...method,
                id: 'googlepaystripeocs',
                config: { ...method.config, vaultingWalletEnabled: true },
            };

            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        });

        it('renders the checkbox when the shopper can vault an instrument', () => {
            renderWithForm();

            expect(screen.getByLabelText(SAVE_LABEL)).toBeInTheDocument();
        });

        it('does not render the checkbox for a guest shopper', () => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

            renderWithForm();

            expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
        });

        it('does not render the checkbox when the merchant has wallet vaulting disabled', () => {
            renderWithForm({
                ...vaultingMethod,
                config: { ...method.config, vaultingWalletEnabled: false },
            });

            expect(screen.queryByLabelText(SAVE_LABEL)).not.toBeInTheDocument();
        });

        it('reports the shopper choice to the SDK at pay time', () => {
            (paymentForm.getFieldValue as jest.Mock).mockReturnValue(true);

            renderWithForm();

            jest.runAllTimers();

            const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock
                .calls[0][0] as Record<string, { getFieldsValues(): HostedInstrument }>;

            expect(initializeOptions[vaultingMethod.id].getFieldsValues()).toEqual({
                shouldSaveInstrument: true,
            });
            expect(paymentForm.getFieldValue).toHaveBeenCalledWith('shouldSaveInstrument');
        });

        it('reports false when the shopper leaves the checkbox unchecked', () => {
            (paymentForm.getFieldValue as jest.Mock).mockReturnValue(undefined);

            renderWithForm();

            jest.runAllTimers();

            const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock
                .calls[0][0] as Record<string, { getFieldsValues(): HostedInstrument }>;

            expect(initializeOptions[vaultingMethod.id].getFieldsValues()).toEqual({
                shouldSaveInstrument: false,
            });
        });
    });
});
