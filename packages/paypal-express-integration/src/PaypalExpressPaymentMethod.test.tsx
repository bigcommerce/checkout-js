import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    LanguageService,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import {
    PaymentFormService,
    PaymentMethodId,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getCustomer,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import PaypalExpressPaymentMethod, {
    PaypalExpressPaymentMethodProps,
} from './PaypalExpressPaymentMethod';

describe('when using Paypal Express payment', () => {
    let PaypalExpressPaymentTest: FunctionComponent<
        PaymentMethodProps & PaypalExpressPaymentMethodProps
    >;
    let paypalExpressProps: PaymentMethodProps & PaypalExpressPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        paypalExpressProps = {
            checkoutService,
            checkoutState,
            language: { translate: jest.fn() } as unknown as LanguageService,
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.PaypalExpress,
            },
            onUnhandledError: jest.fn(),
            paymentForm: jest.fn() as unknown as PaymentFormService,
        };

        PaypalExpressPaymentTest = (props) => {
            return <PaypalExpressPaymentMethod {...props} />;
        };
    });

    it('successfully initializes payment with required props', () => {
        render(<PaypalExpressPaymentTest {...paypalExpressProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: paypalExpressProps.method.gateway,
            methodId: paypalExpressProps.method.id,
            paypalexpress: {
                useRedirectFlow: false,
            },
        });
    });

    it('successfully initializes payment with required props: embedded mode', () => {
        render(<PaypalExpressPaymentTest {...paypalExpressProps} isEmbedded={true} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: paypalExpressProps.method.gateway,
            methodId: paypalExpressProps.method.id,
            paypalexpress: {
                useRedirectFlow: true,
            },
        });
    });
});
