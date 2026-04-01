import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { createWorldpayAccessOpenBankingPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/worldpayaccess';
import React, { type FunctionComponent } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import WorldpayOpenBankingPaymentMethod from './WorldpayOpenBankingPaymentMethod';

function getWorldpayOpenBankingMethod() {
    return {
        ...getPaymentMethod(),
        id: 'open_banking',
        gateway: 'worldpayaccess',
        method: 'openbanking',
        config: {
            ...getPaymentMethod().config,
            displayName: 'Open Banking',
            testMode: true,
        },
    };
}

describe('WorldpayOpenBankingPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let deinitializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentRequestOptions]
    >;
    let checkoutState: CheckoutSelectors;
    let props: PaymentMethodProps;
    let WorldpayOpenBankingTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        props = {
            method: getWorldpayOpenBankingMethod(),
            checkoutService,
            checkoutState,
            paymentForm: {
                disableSubmit: jest.fn(),
            } as unknown as PaymentMethodProps['paymentForm'],
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
        WorldpayOpenBankingTest = () => <WorldpayOpenBankingPaymentMethod {...props} />;
    });

    it('initializes payment with the required config', () => {
        render(<WorldpayOpenBankingTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'worldpayaccess',
            methodId: 'open_banking',
            integrations: [createWorldpayAccessOpenBankingPaymentStrategy],
        });
    });

    it('deinitializes payment when component unmounts', () => {
        render(<WorldpayOpenBankingTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'worldpayaccess',
            methodId: 'open_banking',
        });
    });
});
