import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { mount } from 'enzyme';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    CheckoutProvider,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreePaypalPaymentMethod, getCart, getCustomer,
    getPaymentFormServiceMock,
    getStoreConfig
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import HostedPaymentMethodComponent from 'packages/hosted-payment-integration/src/HostedPaymentComponent';

import { BraintreePaypalPaymentMethod } from './index';

describe('BraintreePaypalPaymentMethod', () => {
    let eventEmitter: EventEmitter;
    let BraintreePaypalPaymentMethodTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    let localeContext: LocaleContextType;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const defaultProps = {
        checkoutService,
        checkoutState,

        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getBraintreePaypalPaymentMethod(),
        onUnhandledError: jest.fn(),

        paymentForm: jest.fn() as unknown as PaymentFormService,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        paymentForm = getPaymentFormServiceMock();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        BraintreePaypalPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BraintreePaypalPaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted payment method', () => {
        const container = mount(<BraintreePaypalPaymentMethodTest />);

        expect(container.find(HostedPaymentMethodComponent)).toHaveLength(1);
    });

    it('initializes BraintreePaypalPaymentMethod', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreePaypalPaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            braintree: {
                onError: expect.any(Function),
                onRenderButton: expect.any(Function),
                submitForm: expect.any(Function),
                containerId: "#checkout-payment-continue",
            }
        });
    });

    it('throws specific error text when receive INSTRUMENT_DECLINED error message', async () => {
        const providerError = new Error('INSTRUMENT_DECLINED');

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onError', () => {
                if (options.braintree?.onError) {
                    options.braintree.onError(providerError);
                }
            });

            return Promise.resolve(checkoutState);
        });

        mount(<BraintreePaypalPaymentMethodTest />);

        eventEmitter.emit('onError');

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(
            new Error(defaultProps.language.translate('payment.errors.instrument_declined')),
        );
    });
});
