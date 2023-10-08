import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    Instrument,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';

import { getCardInstrument, getCart, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import isInstrumentCardCodeRequiredSelector from './isInstrumentCardCodeRequiredSelector';

describe('isInstrumentCardCodeRequiredSelector()', () => {
    let mockInstrument: Instrument;
    let mockPaymentsMethod: PaymentMethod;
    let checkoutState: CheckoutSelectors;
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        mockInstrument = getCardInstrument();
        mockPaymentsMethod = getPaymentMethod();
    });

    it('return true if cart has lineItems.digitalItems', () => {
        expect(
            isInstrumentCardCodeRequiredSelector(checkoutState)(mockInstrument, mockPaymentsMethod),
        ).toBe(true);
    });

    it('return false if cart does not have lineItems.digitalItems', () => {
        const cart = getCart();

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...cart,
            lineItems: {
                ...cart.lineItems,
                digitalItems: [],
            },
        });

        expect(
            isInstrumentCardCodeRequiredSelector(checkoutState)(mockInstrument, mockPaymentsMethod),
        ).toBe(false);
    });

    it('return false if cart does not have lineItems', () => {
        const cart = getCart();

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...cart,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            lineItems: undefined,
        });

        expect(
            isInstrumentCardCodeRequiredSelector(checkoutState)(mockInstrument, mockPaymentsMethod),
        ).toBe(false);
    });
});
