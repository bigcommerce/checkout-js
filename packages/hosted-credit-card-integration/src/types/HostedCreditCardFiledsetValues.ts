export interface HostedCreditCardFieldsetValues {
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

export interface HostedCreditCardValidationValues extends CardInstrumentFieldsetValues {
    hostedForm: {
        errors?: {
            cardCodeVerification?: string;
            cardNumberVerification?: string;
        };
    };
}

interface CardInstrumentFieldsetValues {
    instrumentId: string;
}
