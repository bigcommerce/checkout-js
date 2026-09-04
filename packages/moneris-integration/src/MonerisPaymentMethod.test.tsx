import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { createMonerisPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/moneris';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/contexts';
import { ErrorLevelType, type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { act } from '@bigcommerce/checkout/test-utils';

import getMonerisIframeStyles from './getMonerisIframeStyles';
import MonerisPaymentMethod from './MonerisPaymentMethod';

jest.mock('./getMonerisIframeStyles', () => jest.fn());

describe('when using Moneris payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;
    let errorLogger: ErrorLogger;

    const monerisIframeStyles = {
        cssBody: 'font-family: "Open Sans", sans-serif;background: transparent;',
        cssTextbox: 'border-radius: 4px;width: 100%;',
        cssTextboxCardNumber: 'width: 100%;',
        cssTextboxExpiryDate: 'width: 120px;',
        cssTextboxCVV: 'width: 80px;',
        cssInputLabel: 'font-weight: 500;',
    };

    beforeEach(() => {
        paymentForm = getPaymentFormServiceMock();

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: PaymentMethodId.Moneris };

        jest.mocked(getMonerisIframeStyles).mockReturnValue(monerisIframeStyles);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        errorLogger = { log: jest.fn() };

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService} errorLogger={errorLogger}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <MonerisPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders as hosted widget method', async () => {
        render(<PaymentMethodTest {...defaultProps} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'moneris',
                integrations: [createMonerisPaymentStrategy],
                moneris: expect.objectContaining({
                    containerId: 'moneris-iframe-container',
                    style: monerisIframeStyles,
                }),
            }),
        );
    });

    it('initializes method with required config when no instruments', async () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(getMonerisIframeStyles).toHaveBeenCalledWith({
            cardNumberContainerId: 'moneris-ccNumber',
            onMissingStyleContainer: expect.any(Function),
        });
    });

    it('logs missing style probe containers to errorLogger without interrupting checkout', async () => {
        const styleProbeError = new Error(
            'Unable to retrieve input styles as the provided container ID is not valid.',
        );

        jest.mocked(getMonerisIframeStyles).mockImplementation(({ onMissingStyleContainer }) => {
            onMissingStyleContainer?.(styleProbeError);

            return monerisIframeStyles;
        });

        render(<PaymentMethodTest {...defaultProps} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(errorLogger.log).toHaveBeenCalledWith(
            styleProbeError,
            { errorCode: 'monerisStyleProbe' },
            ErrorLevelType.Warning,
            { containerId: 'moneris-ccNumber' },
        );
        expect(defaultProps.onUnhandledError).not.toHaveBeenCalled();
        expect(checkoutService.initializePayment).toHaveBeenCalled();
    });

    it('calls onUnhandledError when payment initialization fails', async () => {
        const error = new Error('Initialization failed');

        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(error);

        render(<PaymentMethodTest {...defaultProps} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(error);
    });

    it('initializes method with required config with vaulted instruments', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        method = { ...getPaymentMethod(), id: PaymentMethodId.Moneris };

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        defaultProps.method.config.isVaultingEnabled = true;

        render(<PaymentMethodTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                gatewayId: undefined,
                methodId: 'moneris',
                integrations: [createMonerisPaymentStrategy],
                moneris: expect.objectContaining({
                    containerId: 'moneris-iframe-container',
                    style: monerisIframeStyles,
                    form: {
                        fields: {
                            cardCodeVerification: undefined,
                            cardNumberVerification: undefined,
                        },
                        onBlur: expect.any(Function),
                        onCardTypeChange: expect.any(Function),
                        onEnter: expect.any(Function),
                        onFocus: expect.any(Function),
                        onValidate: expect.any(Function),
                        styles: {},
                    },
                }),
            }),
        );
    });
});
