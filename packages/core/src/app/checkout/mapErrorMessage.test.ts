import { getLanguageService } from '@bigcommerce/checkout/locale';

import { mapCheckoutComponentErrorMessage } from './mapErrorMessage';

const translate = getLanguageService().translate;

describe('mapErrorMessage()', () => {
    it('returns correct message when shopping cart is removed', () => {
        const { message, action } = mapCheckoutComponentErrorMessage({ type: 'empty_cart' }, translate);

        expect(message).toBe(translate('cart.empty_cart_error_message'));
        expect(action).toBe('reload');
    });
});
