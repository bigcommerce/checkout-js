import { getLanguageService } from '@bigcommerce/checkout/locale';

import { mapCheckoutComponentErrorMessage } from './mapErrorMessage';

const translate = getLanguageService().translate;

describe('mapErrorMessage()', () => {
    it('returns correct message when shopping cart is removed', () => {
        const { message, action } = mapCheckoutComponentErrorMessage(
            { type: 'empty_cart' },
            translate,
        );

        expect(message).toBe(translate('cart.empty_cart_error_message'));
        expect(action).toBe('reload');
    });

    it('returns the cart unavailable message and the cart action after signing in', () => {
        const { message, action } = mapCheckoutComponentErrorMessage(
            { type: 'sign_in_cart_unavailable' },
            translate,
        );

        expect(message).toBe(translate('customer.sign_in_cart_unavailable_error'));
        expect(action).toBe('cart_page');
    });
});
