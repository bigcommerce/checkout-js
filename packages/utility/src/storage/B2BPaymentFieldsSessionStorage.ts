export class B2BPaymentFieldsSessionStorage {
    /* eslint-disable @typescript-eslint/naming-convention -- UPPER_CASE key constants, mirroring B2BExtraFieldsSessionStorage */
    static readonly PO_NUMBER_KEY = 'poNumber';
    static readonly ADDITIONAL_PAYMENT_FIELD_KEY = 'additionalPaymentField';
    static readonly INVOICE_COMMENT_KEY = 'invoicePaymentComment';
    /* eslint-enable @typescript-eslint/naming-convention */

    static get(key: string): string {
        return sessionStorage.getItem(key) ?? '';
    }

    static set(key: string, value: string): void {
        if (value) {
            sessionStorage.setItem(key, value);
        } else {
            sessionStorage.removeItem(key);
        }
    }

    static remove(key: string): void {
        sessionStorage.removeItem(key);
    }

    static clearAll(): void {
        [this.PO_NUMBER_KEY, this.ADDITIONAL_PAYMENT_FIELD_KEY, this.INVOICE_COMMENT_KEY].forEach(
            (key) => this.remove(key),
        );
    }
}
