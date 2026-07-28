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

        jest.mocked(getMonerisIframeStyles).mockResolvedValue(monerisIframeStyles);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
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
            cardExpiryContainerId: 'moneris-ccExpiry',
            cardCodeContainerId: 'moneris-ccCvv',
        });
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
