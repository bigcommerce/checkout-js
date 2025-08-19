import {
    type CheckoutSelectors,
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { renderHook } from '@testing-library/react';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import { useHostedCreditCard } from './useHostedCreditCard';

describe('useHostedCreditCard', () => {
    const checkoutState: CheckoutSelectors = createCheckoutService().getState();
    const method: PaymentMethod = { ...getPaymentMethod(), id: PaymentMethodId.StripeUPE };
    const language = createLanguageService();
    const paymentForm = getPaymentFormServiceMock();
    const props = {
        checkoutState,
        method,
        language,
        paymentForm,
    };

    it('should render hook', () => {
        const { result } = renderHook(() => useHostedCreditCard(props));

        expect(result.current).toStrictEqual({
            getHostedFormOptions: expect.any(Function),
            getHostedStoredCardValidationFieldset: expect.any(Function),
        });
    });
});
