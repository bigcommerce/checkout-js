import 'card-validator';
import { CreditCardType as OriginalCreditCardType, CreditCardTypeInfo as OriginalCreditCardTypeInfo } from 'credit-card-type';

// Merge @types/card-validator with missing methods
declare module 'card-validator' {
    interface CreditCardTypeInfo extends OriginalCreditCardTypeInfo {
        patterns?: Array<number | [number, number]>;
    }

    interface CreditCardType extends OriginalCreditCardType {
        getTypeInfo(type: string): CreditCardTypeInfo;
        updateCard(type: string, updates: Partial<CreditCardTypeInfo>): void;
    }

    export const creditCardType: CreditCardType;
}
