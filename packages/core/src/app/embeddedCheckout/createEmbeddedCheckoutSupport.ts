import { LanguageService } from '@bigcommerce/checkout-sdk';

import { CheckoutSupport, NoopCheckoutSupport } from '../checkout';

import isEmbedded from './isEmbedded';
import EmbeddedCheckoutSupport from './EmbeddedCheckoutSupport';

const UNSUPPORTED_METHODS = [
    'afterpay',
    'amazon',
    'chasepay',
    'googlepay',
    'klarna',
    'masterpass',
];

export default function createEmbeddedCheckoutSupport(
    language: LanguageService
): CheckoutSupport {
    return isEmbedded() ?
        new EmbeddedCheckoutSupport(UNSUPPORTED_METHODS, language) :
        new NoopCheckoutSupport();
}
