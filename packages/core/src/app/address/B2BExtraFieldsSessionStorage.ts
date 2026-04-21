export class B2BExtraFieldsSessionStorage {
    static readonly BILLING_KEY = 'b2bAddressExtraFields_billing';
    static readonly SHIPPING_KEY = 'b2bAddressExtraFields_shipping';
    static readonly CONSIGNMENT_KEY_PREFIX = 'b2bAddressExtraFields_consignment_';

    static getConsignmentKey(consignmentId: string): string {
        return `${this.CONSIGNMENT_KEY_PREFIX}${consignmentId}`;
    }

    static setFields(key: string, fields: Record<string, unknown>): void {
        sessionStorage.setItem(key, btoa(encodeURIComponent(JSON.stringify(fields))));
    }

    static getFields(key: string): Record<string, unknown> | undefined {
        const raw = sessionStorage.getItem(key);

        if (!raw) {
            return undefined;
        }

        try {
            return JSON.parse(decodeURIComponent(atob(raw))) as Record<string, unknown>;
        } catch {
            return undefined;
        }
    }

    static removeFields(key: string): void {
        sessionStorage.removeItem(key);
    }

    static reassignConsignmentKey(consignmentId: string): void {
        const tempKey = this.getConsignmentKey('');
        const fields = this.getFields(tempKey);

        if (fields) {
            this.setFields(this.getConsignmentKey(consignmentId), fields);
            this.removeFields(tempKey);
        }
    }
}
