/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentMethodId,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import DigitalRiverPaymentMethod from './DigitalRiverPaymentMethod';

describe('DigitalRiverPaymentMethod', () => {
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let method: PaymentMethod;
    const digitalRiverMethod = getPaymentMethod();

    digitalRiverMethod.config.isVaultingEnabled = true;
    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: PaymentMethodId.DigitalRiver };
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        defaultProps = {
            method,
            checkoutService: createCheckoutService(),
            checkoutState: checkoutService.getState(),
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <DigitalRiverPaymentMethod {...defaultProps} {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });
    it('renders as hosted drop in method', () => {
        const { container } = render(<PaymentMethodTest {...defaultProps} method={method} />);
        expect(container.getElementsByClassName('paymentMethod--hosted')).toHaveLength(1);
    });

    it('initializes method with required config', async () => {
        const initializePaymentMock = jest.fn();

        defaultProps.checkoutService.initializePayment = initializePaymentMock;
        render(<PaymentMethodTest {...defaultProps} />);
        expect(initializePaymentMock).toHaveBeenCalled();
        await new Promise((resolve) => process.nextTick(resolve));
        expect(initializePaymentMock).toHaveBeenCalledWith({
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
