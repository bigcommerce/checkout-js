export class B2BExtraAddressFieldsSessionStorage {
    static readonly BILLING_KEY = 'b2bExtraAddressFields_billing';
    static readonly SHIPPING_KEY = 'b2bExtraAddressFields_shipping';
    static readonly CONSIGNMENT_KEY_PREFIX = 'b2bExtraAddressFields_consignment_';

    static getConsignmentKey(consignmentId: string): string {
        return `${this.CONSIGNMENT_KEY_PREFIX}${consignmentId}`;
    }

    static setFields(key: string, fields: Record<string, unknown>): void {
        try {
            sessionStorage.setItem(key, JSON.stringify(fields));
        } catch {
            // sessionStorage may be unavailable (e.g. private browsing restrictions)
        }
    }

    static getFields(key: string): Record<string, unknown> | undefined {
        try {
            const raw = sessionStorage.getItem(key);

            return raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined;
        } catch {
            return undefined;
        }
    }

    static removeFields(key: string): void {
        try {
            sessionStorage.removeItem(key);
        } catch {
            // ignore
        }
    }
}
