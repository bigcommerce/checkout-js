import { createCheckoutService, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

describe('MolliePaymentMethod', () => {
    let method: PaymentMethod;
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = {...defaultProps.method, id: 'mollie', gateway: 'mollie', method: 'multi-options'};

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        PaymentMethodTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <Formik
                        initialValues={ {} }
                        onSubmit={ noop }
                    >
                        <PaymentMethodComponent { ...props } />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

        expect(component.props())
            .toEqual(expect.objectContaining({
                method,
                initializePayment: expect.any(Function),
            }));
    });

    it('initializes method with required config', () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalled();

        expect(checkoutService.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                gatewayId: method.gateway,
                methodId: method.id,
                mollie: {
                    cardCvcId: 'mollie-card-cvc-component-field',
                    cardExpiryId: 'mollie-card-expiry-component-field',
                    cardHolderId: 'mollie-card-holder-component-field',
                    cardNumberId: 'mollie-card-number-component-field',
                    styles : {
                        base: {
                            color: '#333333',
                            '::placeholder' : {
                                color: '#999999',
                            },
                        },
                        valid: {
                            color: '#090',
                        },
                        invalid: {
                            color: '#D14343',
                        },
                    },
                },
            }));
    });
});
