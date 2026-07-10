export interface B2BStoredAddressIds {
    billingAddressId?: number;
    shippingAddressId?: number;
}

export interface B2BStoredPaymentValues {
    poNumber?: string;
    invoicePaymentComment?: string;
    additionalPaymentField?: string;
    orderExtraFields?: Record<string, unknown>;
}

function isStringValue(value: unknown): value is string | undefined {
    return value === undefined || typeof value === 'string';
}

function isB2BStoredPaymentValues(value: unknown): value is B2BStoredPaymentValues {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const poNumber = 'poNumber' in value ? value.poNumber : undefined;
    const invoicePaymentComment =
        'invoicePaymentComment' in value ? value.invoicePaymentComment : undefined;
    const additionalPaymentField =
        'additionalPaymentField' in value ? value.additionalPaymentField : undefined;
    const orderExtraFields = 'orderExtraFields' in value ? value.orderExtraFields : undefined;

    return (
        isStringValue(poNumber) &&
        isStringValue(invoicePaymentComment) &&
        isStringValue(additionalPaymentField) &&
        (orderExtraFields === undefined ||
            (typeof orderExtraFields === 'object' &&
                orderExtraFields !== null &&
                !Array.isArray(orderExtraFields)))
    );
}

export class B2BSessionStorage {
    static readonly keyPrefix = 'checkout_js_b2b';
    static readonly billingAddressIdKey = `${this.keyPrefix}_billingAddressId`;
    static readonly shippingAddressIdKey = `${this.keyPrefix}_shippingAddressId`;
    static readonly paymentValuesKey = `${this.keyPrefix}_paymentValues`;

    // Overwrites both keys so ids from a previous order submission can never
    // outlive the order they belong to.
    static setAddressIds({ billingAddressId, shippingAddressId }: B2BStoredAddressIds): void {
        this.setOrRemove(this.billingAddressIdKey, billingAddressId);
        this.setOrRemove(this.shippingAddressIdKey, shippingAddressId);
    }

    static getAddressIds(): B2BStoredAddressIds {
        return {
            billingAddressId: this.getNumber(this.billingAddressIdKey),
            shippingAddressId: this.getNumber(this.shippingAddressIdKey),
        };
    }

    static setPaymentValues(values: B2BStoredPaymentValues): void {
        sessionStorage.setItem(this.paymentValuesKey, this.encode(values));
    }

    static getPaymentValues(): B2BStoredPaymentValues | undefined {
        const value = this.decode(this.paymentValuesKey);

        return isB2BStoredPaymentValues(value) ? value : undefined;
    }

    static clearAll(): void {
        Object.keys(sessionStorage)
            .filter((key) => key.startsWith(this.keyPrefix))
            .forEach((key) => sessionStorage.removeItem(key));
    }

    private static encode(value: unknown): string {
        return btoa(encodeURIComponent(JSON.stringify(value)));
    }

    private static decode(key: string): unknown {
        const raw = sessionStorage.getItem(key);

        if (!raw) {
            return undefined;
        }

        try {
            // JSON.parse is typed `any`; this is the single assertion that types the decoded value.
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return JSON.parse(decodeURIComponent(atob(raw))) as unknown;
        } catch {
            return undefined;
        }
    }

    private static setOrRemove(key: string, value: number | undefined): void {
        if (value === undefined) {
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, this.encode(value));
        }
    }

    private static getNumber(key: string): number | undefined {
        const value = this.decode(key);

        return typeof value === 'number' ? value : undefined;
    }
}
