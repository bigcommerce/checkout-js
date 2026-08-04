import { type Address, type LanguageService, type PaymentMethod } from '@bigcommerce/checkout-sdk';

import {
    getPaymentMethodName,
    getUniquePaymentMethodId,
    hasPaymentMethodWithId,
} from './paymentMethod';
import { type PaymentMethodsRefreshAlertData } from './PaymentMethodsRefreshAlert';

export default function getPaymentMethodsRefreshAlert({
    billingAddress,
    language,
    previousSelectedMethod,
    refreshedMethods,
}: {
    billingAddress?: Address;
    language: LanguageService;
    previousSelectedMethod?: PaymentMethod;
    refreshedMethods: PaymentMethod[];
}): PaymentMethodsRefreshAlertData {
    const isPreviousSelectedRemoved =
        previousSelectedMethod &&
        !hasPaymentMethodWithId(
            refreshedMethods,
            getUniquePaymentMethodId(previousSelectedMethod.id, previousSelectedMethod.gateway),
        );

    return {
        countryName: billingAddress?.country || billingAddress?.countryCode || '',
        removedMethodName: isPreviousSelectedRemoved
            ? getPaymentMethodName(language)(previousSelectedMethod)
            : undefined,
    };
}
