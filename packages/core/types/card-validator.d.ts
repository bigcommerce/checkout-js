import 'card-validator';
import {
    CreditCardType as OriginalCreditCardType,
    CreditCardTypeInfo as OriginalCreditCardTypeInfo,
} from 'credit-card-type';

// Merge @types/card-validator with missing methods
declare module 'card-validator' {
    type CardBrand =
        | 'american-express'
        | 'diners-club'
        | 'discover'
        | 'jcb'
        | 'maestro'
        | 'mastercard'
        | 'unionpay'
        | 'visa'
        | 'mada';

    interface CreditCardTypeInfo extends OriginalCreditCardTypeInfo {
        type?: CardBrand;
        patterns?: Array<number | [number, number]>;
    }

    interface CreditCardType extends OriginalCreditCardType {
        getTypeInfo(type: string): CreditCardTypeInfo;
        updateCard(type: string, updates: Partial<CreditCardTypeInfo>): void;
        addCard(config: Partial<CreditCardTypeInfo>): void;
    }

    export const creditCardType: CreditCardType;
}
