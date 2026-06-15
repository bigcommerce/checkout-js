export interface B2BStoredMetadata {
    poNumber: string;
    additionalPaymentField: string;
    invoiceComment: string;
    orderExtraFields?: Record<string, unknown>;
    billingExtraFields?: Record<string, unknown>;
    shippingExtraFields?: Record<string, unknown>;
    billingAddressId?: number;
    shippingAddressId?: number;
}

export class B2BSessionStorage {
    static readonly keyPrefix = 'b2b';
    // payment fields
    static readonly poNumberKey = `${this.keyPrefix}_poNumber`;
    static readonly additionalPaymentFieldKey = `${this.keyPrefix}_additionalPaymentField`;
    static readonly invoiceCommentKey = `${this.keyPrefix}_invoiceComment`;
    // address / order extra fields
    static readonly billingExtraFieldsKey = `${this.keyPrefix}_addressExtraFields_billing`;
    static readonly shippingExtraFieldsKey = `${this.keyPrefix}_addressExtraFields_shipping`;
    static readonly consignmentExtraFieldsKeyPrefix = `${this.keyPrefix}_addressExtraFields_consignment_`;
    static readonly orderExtraFieldsKey = `${this.keyPrefix}_orderExtraFields`;
    static readonly billingAddressIdKey = `${this.keyPrefix}_billingAddressId`;
    static readonly shippingAddressIdKey = `${this.keyPrefix}_shippingAddressId`;

    static getConsignmentKey(consignmentId: string): string {
        return `${this.consignmentExtraFieldsKeyPrefix}${consignmentId}`;
    }

    static set(key: string, value: unknown): void {
        sessionStorage.setItem(key, btoa(encodeURIComponent(JSON.stringify(value))));
    }

    static get<T = Record<string, unknown>>(key: string): T | undefined {
        const raw = sessionStorage.getItem(key);

        if (!raw) {
            return undefined;
        }

        try {
            // JSON.parse is typed `any`; this is the single assertion that types the decoded value.
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return JSON.parse(decodeURIComponent(atob(raw))) as T;
        } catch {
            return undefined;
        }
    }

    // Typed convenience so address-id reads stay cast-free.
    static getAddressId(key: string): number | undefined {
        return this.get<number>(key);
    }

    // String fields default to '' so form inputs stay controlled and the payload shape is unchanged.
    static getValue(key: string): string {
        return this.get<string>(key) ?? '';
    }

    // Reads every stored B2B value at once so consumers can destructure instead of passing keys.
    static getAll(): B2BStoredMetadata {
        return {
            poNumber: this.getValue(this.poNumberKey),
            additionalPaymentField: this.getValue(this.additionalPaymentFieldKey),
            invoiceComment: this.getValue(this.invoiceCommentKey),
            orderExtraFields: this.get(this.orderExtraFieldsKey),
            billingExtraFields: this.get(this.billingExtraFieldsKey),
            shippingExtraFields: this.get(this.shippingExtraFieldsKey),
            billingAddressId: this.getAddressId(this.billingAddressIdKey),
            shippingAddressId: this.getAddressId(this.shippingAddressIdKey),
        };
    }

    static remove(key: string): void {
        sessionStorage.removeItem(key);
    }

    static clearAll(): void {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith(this.keyPrefix))
            .forEach((key) => sessionStorage.removeItem(key));
    }

    static copyShippingToBilling(): void {
        const shippingFields = this.get(this.shippingExtraFieldsKey);

        if (shippingFields) {
            this.set(this.billingExtraFieldsKey, shippingFields);
        }

        const shippingAddressId = this.getAddressId(this.shippingAddressIdKey);

        if (shippingAddressId) {
            this.set(this.billingAddressIdKey, shippingAddressId);
        } else {
            this.remove(this.billingAddressIdKey);
        }
    }

    static reassignConsignmentKey(consignmentId: string): void {
        const tempKey = this.getConsignmentKey('');
        const fields = this.get(tempKey);

        if (fields) {
            this.set(this.getConsignmentKey(consignmentId), fields);
            this.remove(tempKey);
        }
    }
}
