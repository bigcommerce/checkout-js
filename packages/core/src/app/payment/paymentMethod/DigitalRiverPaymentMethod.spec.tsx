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

import HostedDropInPaymentMethod, {
    HostedDropInPaymentMethodProps,
} from './HostedDropInPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('when using Digital River payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    const digitalRiverMethod = getPaymentMethod();

    digitalRiverMethod.config.isVaultingEnabled = true;

    beforeEach(() => {
        defaultProps = {
            method: digitalRiverMethod,
            onUnhandledError: jest.fn(),
        };
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...digitalRiverMethod, id: PaymentMethodId.DigitalRiver };

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

    it('renders as hosted drop in method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedDropInPaymentMethodProps> =
            container.find(HostedDropInPaymentMethod);

        expect(component.props()).toEqual(
            expect.objectContaining({
                containerId: `${method.id}-component-field`,
                initializePayment: expect.any(Function),
                method,
                onUnhandledError: expect.any(Function),
            }),
        );
    });

    it('initializes method with required config including initializationData', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedDropInPaymentMethodProps> =
            container.find(HostedDropInPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            digitalriver: {
                configuration: {
                    button: {
                        type: 'submitOrder',
                    },
                    flow: 'checkout',
                    paymentMethodConfiguration: {
                        classes: {
                            base: 'form-input optimizedCheckout-form-input',
                        },
                    },
                    showComplianceSection: false,
                    showSavePaymentAgreement: true,
                    showTermsOfSaleDisclosure: true,
                    usage: 'unscheduled',
                },
                containerId: `${method.id}-component-field`,
                onError: expect.any(Function),
                onSubmitForm: expect.any(Function),
            },
            gatewayId: undefined,
            methodId: 'digitalriver',
        });
    });

    it('initializes method with required config and without initializationData', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedDropInPaymentMethodProps> =
            container.find(HostedDropInPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            digitalriver: {
                configuration: {
                    button: {
                        type: 'submitOrder',
                    },
                    flow: 'checkout',
                    paymentMethodConfiguration: {
                        classes: {
                            base: 'form-input optimizedCheckout-form-input',
                        },
                    },
                    showComplianceSection: false,
                    showSavePaymentAgreement: true,
                    showTermsOfSaleDisclosure: true,
                    usage: 'unscheduled',
                },
                containerId: `${method.id}-component-field`,
                onError: expect.any(Function),
                onSubmitForm: expect.any(Function),
            },
            gatewayId: undefined,
            methodId: 'digitalriver',
        });
    });
});
