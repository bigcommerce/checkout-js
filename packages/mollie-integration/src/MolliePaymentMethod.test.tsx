/* eslint-disable testing-library/no-container */
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import MollieCustomCardForm from './MollieCustomCardForm';
import MolliePaymentMethod from './MolliePaymentMethod';

describe('MolliePaymentMethod', () => {
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let method: PaymentMethod;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: PaymentMethodId.Mollie };
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
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <MolliePaymentMethod {...defaultProps} {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const { container } = render(<PaymentMethodTest {...defaultProps} />);
        const component = container.querySelector('.widget.widget--mollie.payment-widget');

        expect(component).toBeInTheDocument();
    });

    it('renders CustomPaymentForm', () => {
        const renderCustomPaymentFormMock = jest.fn(() => (
            <MollieCustomCardForm
                isCreditCard={true}
                method={defaultProps.method}
                options={{
                    cardCvcElementOptions: {
                        containerId: 'mollie-card-cvc-component-field',
                    },
                    cardExpiryElementOptions: {
                        containerId: 'mollie-card-expiry-component-field',
                    },
                    cardHolderElementOptions: {
                        containerId: 'mollie-card-holder-component-field',
                    },
                    cardNumberElementOptions: {
                        containerId: 'mollie-card-number-component-field',
                    },
                }}
            />
        ));

        const customProps = {
            ...defaultProps,
            renderCustomPaymentForm: renderCustomPaymentFormMock,
        };

        const { container } = render(<PaymentMethodTest {...customProps} />);
        const component = container.querySelector(
            '.widget.widget--mollie.payment-widget#mollie-credit-card',
        );

        expect(component).toBeInTheDocument();
    });

    it('initializes method with required config', async () => {
        const initializePaymentMock = jest.fn();

        defaultProps.checkoutService.initializePayment = initializePaymentMock;
        render(<PaymentMethodTest {...defaultProps} />);
        expect(initializePaymentMock).toHaveBeenCalled();
        await new Promise((resolve) => process.nextTick(resolve));

        expect(initializePaymentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                gatewayId: defaultProps.method.gateway,
                methodId: defaultProps.method.id,
                mollie: expect.objectContaining({
                    cardCvcId: 'mollie-card-cvc-component-field',
                    cardExpiryId: 'mollie-card-expiry-component-field',
                    cardHolderId: 'mollie-card-holder-component-field',
                    cardNumberId: 'mollie-card-number-component-field',
                    containerId: 'mollie-credit-card',
                    styles: expect.any(Object),
                    disableButton: expect.any(Function),
                }),
            }),
        );
    });

    describe('when using Mollie payment method', () => {
        beforeEach(() => {
            method = {
                id: 'klarna',
                method: 'klarna',
                supportedCards: [],
                config: {},
                type: 'PAYMENT_TYPE_API',
                gateway: 'mollie',
            };
        });

        it('should render MolliePaymentMethod for One Klarna', () => {
            const { container } = render(<PaymentMethodTest {...defaultProps} />);
            const component = container.querySelector('.widget.widget--mollie.payment-widget');

            expect(component).toBeInTheDocument();
        });
    });
});
