import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import {
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import BoltPaymentMethod from './BoltPaymentMethod';

describe('when using Bolt payment', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        defaultProps = {
            checkoutService,
            checkoutState,
            language: createLanguageService(),
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.Bolt,
                initializationData: {
                    embeddedOneClickEnabled: false,
                },
            },
            onUnhandledError: jest.fn(),
            paymentForm: getPaymentFormServiceMock(),
        };

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        PaymentMethodTest = (props) => <BoltPaymentMethod {...defaultProps} {...props} />;
    });

    it('renders as bolt client payment method if embeddedOneClickEnabled is false', () => {
        defaultProps.method.initializationData.embeddedOneClickEnabled = false;

        const { container } = render(<PaymentMethodTest />);

        expect(container.getElementsByClassName('form-field--bolt-embed')).toHaveLength(0);
    });

    it('renders as bolt embedded payment method if embeddedOneClickEnabled is true', () => {
        defaultProps.method.initializationData.embeddedOneClickEnabled = true;

        const { container } = render(<PaymentMethodTest />);

        expect(container.getElementsByClassName('payment-widget')).toHaveLength(1);
        expect(container.getElementsByClassName('form-field--bolt-embed')).toHaveLength(1);
    });
});
