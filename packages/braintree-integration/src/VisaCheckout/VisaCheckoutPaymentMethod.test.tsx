import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type PaymentInitializeOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { createBraintreeVisaCheckoutPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import { Formik } from 'formik';
import { noop } from 'lodash';
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
    PaymentMethodId,
    type PaymentMethodProps,
    PaymentMethodType,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getAddress,
    getCheckout,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import VisaCheckoutPaymentMethod from './VisaCheckoutPaymentMethod';

describe('when using Visa Checkout payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let VisaCheckoutPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;
    const billingAddress = {
        ...getAddress(),
        id: '1113412341',
    };
    const onUnhandledError = jest.fn();

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentForm = getPaymentFormServiceMock();
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.BraintreeVisaCheckout,
            method: PaymentMethodType.VisaCheckout,
        };
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);

        defaultProps = {
            method,
            onUnhandledError,
            checkoutState,
            checkoutService,
            paymentForm,
            language: localeContext.language,
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        VisaCheckoutPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <VisaCheckoutPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes payment method when component mounts', () => {
        render(<VisaCheckoutPaymentMethodTest {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalled();
    });

    it('renders Visa Checkout as wallet button method', () => {
        render(<VisaCheckoutPaymentMethodTest {...defaultProps} method={method} />);

        expect(
            screen.getByText(
                defaultProps.language.translate('remote.sign_in_action', {
                    providerName: getPaymentMethodName(defaultProps.language)(defaultProps.method),
                }),
            ),
        ).toBeInTheDocument();
    });

    it('initializes method with required config', () => {
        render(<VisaCheckoutPaymentMethodTest {...defaultProps} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                [method.id]: {
                    onError: defaultProps.onUnhandledError,

                    onPaymentSelect: expect.any(Function),
                },
            }),
        );
    });

    it('reinitializes method once payment option is selected', async () => {
        render(<VisaCheckoutPaymentMethodTest {...defaultProps} method={method} />);

        const options: PaymentInitializeOptions = (checkoutService.initializePayment as jest.Mock)
            .mock.calls[0][0];

        (checkoutService.initializePayment as jest.Mock).mockReset();

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options.braintreevisacheckout!.onPaymentSelect!();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({ methodId: method.id });
        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: method.id,
            integrations: [createBraintreeVisaCheckoutPaymentStrategy],
            [method.id]: expect.any(Object),
        });
    });

    it('catches error during component reinitialization', async () => {
        render(<VisaCheckoutPaymentMethodTest {...defaultProps} method={method} />);
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation(() =>
            Promise.reject(new Error('test error')),
        );

        const options: PaymentInitializeOptions = (checkoutService.initializePayment as jest.Mock)
            .mock.calls[0][0];

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options.braintreevisacheckout!.onPaymentSelect!();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({ methodId: method.id });
        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: method.id,
            integrations: [createBraintreeVisaCheckoutPaymentStrategy],
            [method.id]: expect.any(Object),
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
