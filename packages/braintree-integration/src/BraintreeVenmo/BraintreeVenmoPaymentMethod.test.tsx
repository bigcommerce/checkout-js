import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import BraintreeVenmoPaymentMethod from './BraintreeVenmoPaymentMethod';

jest.mock('@bigcommerce/checkout/hosted-payment-integration', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HostedPaymentComponent: jest.fn(() => <>HostedPaymentComponentMock</>),
}));

describe('BraintreeVenmoPaymentMethod', () => {
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let HostedPaymentComponentMock: FunctionComponent;

    beforeEach(() => {
        HostedPaymentComponentMock = HostedPaymentComponent as jest.Mock;
        checkoutService = createCheckoutService();
        checkoutState = {
            ...checkoutService.getState(),
            data: {
                ...checkoutService.getState().data,
                getCart: () => getCart(),
                getConfig: () => getStoreConfig(),
                getCustomer: () => getCustomer(),
            },
        };

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        defaultProps = {
            checkoutService,
            checkoutState,
            language: createLanguageService(),
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
            paymentForm: getPaymentFormServiceMock(),
        };
    });

    it('renders BraintreeVenmoPaymentMethod with provided props', () => {
        render(<BraintreeVenmoPaymentMethod {...defaultProps} />);

        expect(HostedPaymentComponentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                checkoutService: defaultProps.checkoutService,
                checkoutState: defaultProps.checkoutState,
                deinitializePayment: defaultProps.checkoutService.deinitializePayment,
                initializePayment: defaultProps.checkoutService.initializePayment,
                language: defaultProps.language,
                method: defaultProps.method,
                paymentForm: defaultProps.paymentForm,
            }),
            expect.anything(),
        );
    });
});
