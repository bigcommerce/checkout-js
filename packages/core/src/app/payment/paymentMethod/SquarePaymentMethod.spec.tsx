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

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedFieldPaymentMethod, {
    HostedFieldPaymentMethodProps,
} from './HostedFieldPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('when using Square payment', () => {
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
        method = { ...getPaymentMethod(), id: PaymentMethodId.SquareV2 };

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

    it('renders as hosted field method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedFieldPaymentMethodProps> =
            container.find(HostedFieldPaymentMethod);

        expect(component.props()).toEqual(
            expect.objectContaining({
                cardCodeId: 'sq-cvv',
                cardExpiryId: 'sq-expiration-date',
                cardNumberId: 'sq-card-number',
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('initializes method with required config', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedFieldPaymentMethodProps> =
            container.find(HostedFieldPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: method.id,
            gatewayId: method.gateway,
            square: {
                cardNumber: {
                    elementId: 'sq-card-number',
                },
                cvv: {
                    elementId: 'sq-cvv',
                },
                expirationDate: {
                    elementId: 'sq-expiration-date',
                },
                postalCode: {
                    elementId: 'sq-postal-code',
                },
                inputClass: 'form-input',
                inputStyles: [
                    {
                        color: '#333',
                        fontSize: '13px',
                        lineHeight: '20px',
                    },
                ],
            },
        });
    });
});
