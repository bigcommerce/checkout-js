import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import BoltClientPaymentMethod from './BoltClientPaymentMethod';
import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('BoltClientPaymentMethod', () => {
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
                id: PaymentMethodId.Bolt,
                initializationData: {
                    embeddedOneClickEnabled: false,
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

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BoltClientPaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted method', () => {
        const container = mount(<PaymentMethodTest />);

        expect(container.find(HostedPaymentMethod)).toHaveLength(1);
    });

    it('initializes method with required config', () => {
        mount(<PaymentMethodTest />);

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: defaultProps.method.id,
                [defaultProps.method.id]: {
                    useBigCommerceCheckout: true,
                },
            }),
        );
    });
});
