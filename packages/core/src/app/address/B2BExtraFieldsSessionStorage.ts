export class B2BExtraFieldsSessionStorage {
    static readonly KEY_PREFIX = 'b2b';
    static readonly BILLING_KEY = `${this.KEY_PREFIX}AddressExtraFields_billing`;
    static readonly SHIPPING_KEY = `${this.KEY_PREFIX}AddressExtraFields_shipping`;
    static readonly CONSIGNMENT_KEY_PREFIX = `${this.KEY_PREFIX}AddressExtraFields_consignment_`;
    static readonly ORDER_KEY = `${this.KEY_PREFIX}OrderExtraFields`;
    static readonly BILLING_ADDRESS_ID_KEY = `${this.KEY_PREFIX}BillingAddressId`;
    static readonly SHIPPING_ADDRESS_ID_KEY = `${this.KEY_PREFIX}ShippingAddressId`;

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

    static setAddressId(key: string, id: number): void {
        sessionStorage.setItem(key, String(id));
    }

    static getAddressId(key: string): number | undefined {
        const raw = sessionStorage.getItem(key);

        return raw ? Number(raw) : undefined;
    }

    static removeAddressId(key: string): void {
        sessionStorage.removeItem(key);
    }

    static clearAll(): void {
        // Every key this class manages is namespaced with KEY_PREFIX (including the
        // per-consignment keys), so a single prefix sweep removes them all.
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith(this.KEY_PREFIX))
            .forEach((key) => sessionStorage.removeItem(key));
    }

    static copyShippingToBilling(): void {
        const shippingFields = this.getFields(this.SHIPPING_KEY);

        if (shippingFields) {
            this.setFields(this.BILLING_KEY, shippingFields);
        }

        const shippingAddressId = this.getAddressId(this.SHIPPING_ADDRESS_ID_KEY);

        if (shippingAddressId) {
            this.setAddressId(this.BILLING_ADDRESS_ID_KEY, shippingAddressId);
        } else {
            this.removeAddressId(this.BILLING_ADDRESS_ID_KEY);
        }
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
