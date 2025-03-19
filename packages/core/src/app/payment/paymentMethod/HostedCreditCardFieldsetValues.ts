interface HostedCreditCardFieldsetValues {
    hostedForm: {
        cardType?: string;
        errors?: {
            cardCode?: string;
            cardExpiry?: string;
            cardName?: string;
            cardNumber?: string;
        };
    };
}

export function isHostedCreditCardFieldsetValues(
    value: unknown,
): value is HostedCreditCardFieldsetValues {
    if (!(value instanceof Object)) {
        return false;
    }

    if (!('hostedForm' in value)) {
        return false;
    }

    return true;
}
