import { LanguageService } from '@bigcommerce/checkout-sdk';

import { CheckoutSupport, NoopCheckoutSupport } from '../checkout';

import EmbeddedCheckoutSupport from './EmbeddedCheckoutSupport';
import isEmbedded from './isEmbedded';

const UNSUPPORTED_METHODS = ['afterpay', 'applepay', 'amazonpay', 'chasepay', 'googlepay', 'klarna', 'masterpass'];

export default function createEmbeddedCheckoutSupport(language: LanguageService): CheckoutSupport {
    return isEmbedded()
        ? new EmbeddedCheckoutSupport(UNSUPPORTED_METHODS, language)
        : new NoopCheckoutSupport();
}
