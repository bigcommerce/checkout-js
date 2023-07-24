import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { render, fireEvent } from '@testing-library/react';
import React, { FunctionComponent } from 'react';

import { PaymentFormService, PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

import { getPaypalCommerceRatePayMethodMock } from './mocks/paypalCommerceRatePayMocks';
import { getCheckout as getCheckoutMock } from '../../test-utils/src/checkout.mock'
import { Formik } from 'formik';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-utils';
import { FormContext } from '@bigcommerce/checkout/ui';
import PaypalCommerceRatePayPaymentMethod from './PaypalCommerceRatePayPaymentMethod';

describe('PaypalCommerceRatePayPaymentMethod', () => {
    let PaypalCommerceRatePayPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let localeContext: LocaleContextType;
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getPaypalCommerceRatePayMethodMock(),
        checkoutService,
        checkoutState,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        paymentForm: {
            setSubmitted: jest.fn(),
            setValidationSchema: jest.fn(),
            setFieldValue: jest.fn(),
        } as unknown as PaymentFormService,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckoutMock());
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        localeContext = createLocaleContext(getStoreConfig());
        const submit = jest.fn();

        PaypalCommerceRatePayPaymentMethodTest = (props: PaymentMethodProps) => (
            <LocaleContext.Provider value={localeContext}>
                <FormContext.Provider value={{isSubmitted: true, setSubmitted: jest.fn()}}>
                    <Formik initialValues={{}} onSubmit={submit}>
                        {({ handleSubmit }) => (
                            <form aria-label="form" onSubmit={handleSubmit}>
                                <PaypalCommerceRatePayPaymentMethod {...props}/>
                            </form>
                        )}
                    </Formik>
                </FormContext.Provider>
            </LocaleContext.Provider>
        );
    });

    it('successfully initializes payment with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            paypalcommerceratepay: {
                container: '#checkout-payment-continue',
                legalTextContainer: 'legal-text-container',
                getFieldsValues: expect.any(Function),
                onError: expect.any(Function),
            },
        });
    });

    it('renders component with required fields', async  () => {
        const view = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        expect(view).toMatchSnapshot();
    });

    it('submits form', async  () => {
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);
        const submitForm = jest.fn();
        const form = document.querySelectorAll('form')[0];
        form.onsubmit = submitForm;

        fireEvent.submit(form);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submitForm).toHaveBeenCalled();
    });

    it('deinitializes PaypalCommerceRatePayPaymentMethod', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const component = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        component.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('catches error during PaypalCommerceRatePayPaymentMethod initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during PaypalCommerceRatePayPaymentMethod deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const component = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });
});
