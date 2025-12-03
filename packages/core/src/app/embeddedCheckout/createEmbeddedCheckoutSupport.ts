import { type LanguageService } from '@bigcommerce/checkout-sdk';

import { type CheckoutSupport, NoopCheckoutSupport } from '../checkout';

import EmbeddedCheckoutSupport from './EmbeddedCheckoutSupport';
import isEmbedded from './isEmbedded';

const UNSUPPORTED_METHODS = ['afterpay', 'applepay', 'amazonpay', 'googlepay', 'klarna'];

export default function createEmbeddedCheckoutSupport(language: LanguageService): CheckoutSupport {
    return isEmbedded()
        ? new EmbeddedCheckoutSupport(UNSUPPORTED_METHODS, language)
        : new NoopCheckoutSupport();
}
