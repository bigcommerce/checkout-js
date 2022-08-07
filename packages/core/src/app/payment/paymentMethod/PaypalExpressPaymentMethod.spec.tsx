import { createCheckoutService, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodType from './PaymentMethodType';

describe('when using Paypal Express payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.PaypalExpress,
            method: PaymentMethodType.Paypal,
        };

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

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

    it('renders as hosted payment method', () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

        expect(container.find(HostedPaymentMethod).length)
            .toEqual(1);
    });

    it('initializes method with required config', () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
        const component: ReactWrapper<HostedPaymentMethodProps> = container.find(HostedPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                methodId: 'paypalexpress',
                paypalexpress: {
                    useRedirectFlow: false,
                },
            }));
    });

    it('uses redirect flow when in embedded mode', () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } isEmbedded={ true } method={ method } />);
        const component: ReactWrapper<HostedPaymentMethodProps> = container.find(HostedPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                methodId: 'paypalexpress',
                paypalexpress: {
                    useRedirectFlow: true,
                },
            }));
    });
});
