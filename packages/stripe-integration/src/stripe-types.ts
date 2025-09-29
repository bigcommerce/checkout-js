type StripeAppearanceValues = string | string[] | number | undefined;

export interface StripeAppearanceOptions {
    variables?: Record<string, StripeAppearanceValues>;

    rules?: Record<string, Record<string, StripeAppearanceValues>>;
}

interface CssFontSource {
    cssSrc: string;
}

interface CustomFontSource {
    family: string;
    src: string;
    display?: string;
    style?: string;
    unicodeRange?: string;
    weight?: string;
}

export type StripeCustomFont = CssFontSource | CustomFontSource;

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
