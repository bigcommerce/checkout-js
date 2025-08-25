import { type LanguageService } from '@bigcommerce/checkout-sdk';

import { type CheckoutSupport } from '../checkout';

import { EmbeddedCheckoutUnsupportedError } from './errors';

export default class EmbeddedCheckoutSupport implements CheckoutSupport {
    constructor(private unsupportedMethods: string[], private langService: LanguageService) {}

    isSupported(...ids: string[]): boolean {
        const unsupportedMethods = ids.filter((id) => this.unsupportedMethods.includes(id));

        if (unsupportedMethods.length === 0) {
            return true;
        }

        throw new EmbeddedCheckoutUnsupportedError(
            this.langService.translate('embedded_checkout.unsupported_error', {
                methods: unsupportedMethods.join(', '),
            }),
        );
    }
}
