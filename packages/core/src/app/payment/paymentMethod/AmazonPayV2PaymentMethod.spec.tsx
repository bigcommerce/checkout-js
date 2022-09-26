import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('when using AmazonPay payment', () => {
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
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.AmazonPay,
            initializationData: {
                paymentDescriptor: 'Hey Amazon',
                paymentToken: 'abcdefg',
            },
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <PaymentMethodComponent {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

        expect(component.props()).toEqual(
            expect.objectContaining({
                buttonId: 'editButtonId',
                containerId: 'paymentWidget',
                deinitializeCustomer: undefined,
                hideWidget: true,
                initializeCustomer: undefined,
                initializePayment: expect.any(Function),
                isSignInRequired: false,
                method,
                onSignOut: expect.any(Function),
                paymentDescriptor: 'Hey Amazon',
                shouldShowDescriptor: true,
                shouldShowEditButton: true,
            }),
        );
    });

    it('initializes method with required config', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                [method.id]: {
                    editButtonId: 'editButtonId',
                },
            }),
        );
    });
});
