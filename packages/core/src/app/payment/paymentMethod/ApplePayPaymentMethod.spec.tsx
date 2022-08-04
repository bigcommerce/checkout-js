import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import ApplePayPaymentMethod from './ApplePayPaymentMethod';
import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('ApplePayPaymentMethod', () => {
    let defaultProps: HostedPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        defaultProps = {
            initializePayment: jest.fn(),
            deinitializePayment: jest.fn(),
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.ApplePay,
                initializationData: {
                    merchantCapabilities: [
                        'supports3DS',
                    ],
                },
            },
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

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        PaymentMethodTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <PaymentContext.Provider value={ paymentContext }>
                    <LocaleContext.Provider value={ localeContext }>
                        <Formik
                            initialValues={ {} }
                            onSubmit={ noop }
                        >
                            <ApplePayPaymentMethod { ...defaultProps } { ...props } />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted method', () => {
        const container = mount(<PaymentMethodTest />);

        expect(container.find(HostedPaymentMethod).length).toEqual(1);
    });

    it('initializes method with required config', () => {
        mount(<PaymentMethodTest />);

        expect(defaultProps.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                methodId: defaultProps.method.id,
                [defaultProps.method.id]: {
                    shippingLabel: 'Shipping',
                    subtotalLabel: 'Subtotal',
                },
            }));
    });
});
