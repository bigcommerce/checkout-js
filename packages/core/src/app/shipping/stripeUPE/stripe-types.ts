interface StripeEvent {
    complete: boolean;
    elementType: string;
    empty: boolean;
}

interface StripeAddress {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
}

export interface StripeShippingEvent extends StripeEvent {
    mode?: string;
    isNewAddress?: boolean;
    phoneFieldRequired: boolean;
    value: {
        address: StripeAddress;
        name?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
    fields?: {
        phone: string;
    };
    display?: {
        name: string;
    };
}
