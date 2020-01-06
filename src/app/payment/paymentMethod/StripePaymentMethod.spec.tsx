import { createCheckoutService, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getCreditCardInputStyles } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

jest.mock('../creditCard', () => ({
    ...jest.requireActual('../creditCard'),
    getCreditCardInputStyles: jest.fn<ReturnType<typeof getCreditCardInputStyles>, Parameters<typeof getCreditCardInputStyles>>(
        (_containerId, _fieldType) => {
            return Promise.resolve({ color: 'rgb(255, 0, 0)', fontWeight: '500', fontFamily: 'Montserrat, Arial, Helvetica, sans-serif;', fontSize: '14px', fontSmoothing: 'auto'});
        }
    ),
}));

describe('when using Stripe payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
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
        method = { ...getPaymentMethod(), id: 'stripev3' };

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
                containerId: 'stripe-card-field',
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }));
    });

    it('initializes method with required config', async () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(getCreditCardInputStyles)
            .toHaveBeenCalledWith('stripe-card-field', ['color', 'fontFamily', 'fontWeight', 'fontSmoothing']);

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                [method.id]: {
                    containerId: 'stripe-card-field',
                    style: {
                        base: {
                            color: 'rgb(255, 0, 0)',
                            fontWeight: '500',
                            fontFamily: 'Montserrat, Arial, Helvetica, sans-serif;',
                            fontSize: '14px',
                            fontSmoothing: 'auto',
                            '\'::placeholder\'': {
                                color: '#E1E1E1',
                           },
                        },
                        invalid: {
                            color: '#fa755a',
                            iconColor: '#fa755a',
                        },
                    },
                },
            }));
    });
});
