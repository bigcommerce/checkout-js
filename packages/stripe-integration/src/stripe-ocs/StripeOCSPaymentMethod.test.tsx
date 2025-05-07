import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentMethod,
    WithStripeUPEPaymentInitializeOptions,
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
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { AccordionContext, AccordionContextProps } from '@bigcommerce/checkout/ui';

import StripeOCSPaymentMethod from './StripeOCSPaymentMethod';

jest.mock('./getStripeOCSStyles', () => ({
    getStylesForOCSElement: () => {
        return { color: '#cccccc' };
    },
}));

describe('when using StripeUPE OCS payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let collapseElementMock: jest.Mock;

    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let onToggleMock: jest.Mock;
    let accordionContextValues: AccordionContextProps;

    beforeEach(() => {
        collapseElementMock = jest.fn();
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'pay_now', gateway: PaymentMethodId.StripeUPE };
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        onToggleMock = jest.fn();
        accordionContextValues = {
            onToggle: onToggleMock,
            selectedItemId: 'stripeupe-stripe_ocs',
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AccordionContext.Provider value={accordionContextValues}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <StripeOCSPaymentMethod {...props} />
                        </Formik>
                    </AccordionContext.Provider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'stripeupe',
            methodId: 'pay_now',
            stripeupe: {
                containerId: 'stripe-pay_now-component-field',
                style: { color: '#cccccc' },
                onError: expect.any(Function),
                render: expect.any(Function),
                paymentMethodSelect: expect.any(Function),
                handleClosePaymentMethod: expect.any(Function),
            },
        });
    });

    it('initializes method with required config when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            isGuest: false,
        });
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            stripeLinkAuthenticationState: true,
        });

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'stripeupe',
            methodId: 'pay_now',
            stripeupe: {
                containerId: 'stripe-pay_now-component-field',
                style: { color: '#cccccc' },
                onError: expect.any(Function),
                render: expect.any(Function),
                paymentMethodSelect: expect.any(Function),
                handleClosePaymentMethod: expect.any(Function),
            },
        });
    });

    it('initializes method with required config', () => {
        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                [`${method.gateway}`]: {
                    containerId: `stripe-${method.id}-component-field`,
                    style: { color: '#cccccc' },
                    onError: expect.any(Function),
                    render: expect.any(Function),
                    paymentMethodSelect: expect.any(Function),
                    handleClosePaymentMethod: expect.any(Function),
                },
            }),
        );
    });

    describe('# Stripe OCS accordion actions', () => {
        it('should call collapse BC accordion when stripe accordion item is selected', () => {
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeUPEPaymentInitializeOptions) => {
                    options.stripeupe?.paymentMethodSelect?.('methodId');

                    return Promise.resolve(checkoutState);
                },
            );
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(onToggleMock).toHaveBeenCalled();
        });

        it('should collapse stripe accordion when BC accordion item selected', () => {
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeUPEPaymentInitializeOptions) => {
                    options.stripeupe?.handleClosePaymentMethod?.(collapseElementMock);

                    return Promise.resolve(checkoutState);
                },
            );

            const { rerender } = render(<PaymentMethodTest {...defaultProps} method={method} />);

            accordionContextValues.selectedItemId = 'nonStripeItem';

            rerender(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(collapseElementMock).toHaveBeenCalled();
        });

        it('should not collapse stripe accordion when Stripe accordion item selected', () => {
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeUPEPaymentInitializeOptions) => {
                    options.stripeupe?.handleClosePaymentMethod?.(collapseElementMock);

                    return Promise.resolve(checkoutState);
                },
            );

            const { rerender } = render(<PaymentMethodTest {...defaultProps} method={method} />);

            accordionContextValues.selectedItemId = 'stripeupe-card';

            rerender(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(collapseElementMock).not.toHaveBeenCalled();
        });
    });
});
