import { type CardInstrumentFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

export interface CreditCardValidationValues extends CardInstrumentFieldsetValues {
    ccCvv?: string;
    ccNumber?: string;
}

export function hasCreditCardNumber(values: unknown): values is { ccNumber: string } {
    if (!(values instanceof Object)) {
        return false;
    }

    return 'ccNumber' in values;
}

export function hasCreditCardExpiry(values: unknown): values is { ccExpiry: string } {
    if (!(values instanceof Object)) {
        return false;
    }

    return 'ccExpiry' in values;
}
