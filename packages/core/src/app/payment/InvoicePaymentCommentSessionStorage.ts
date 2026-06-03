export class InvoicePaymentCommentSessionStorage {
    static readonly KEY = 'invoicePaymentComment';

    static get(): string {
        return sessionStorage.getItem(this.KEY) ?? '';
    }

    static set(value: string): void {
        if (value === '') {
            sessionStorage.removeItem(this.KEY);

            return;
        }

        sessionStorage.setItem(this.KEY, value);
    }

    static remove(): void {
        sessionStorage.removeItem(this.KEY);
    }
}
