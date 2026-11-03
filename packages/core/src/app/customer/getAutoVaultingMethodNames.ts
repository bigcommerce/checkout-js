import { type LanguageService, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { uniq } from 'lodash';

import { isPaymentMethodAutoVaultingInstruments } from '@bigcommerce/checkout/instrument-utils';
import { getPaymentMethodName } from '@bigcommerce/checkout/payment-integration-api';

export const getAutoVaultingMethodNames = (
    language: LanguageService,
    methodIds: string[],
    paymentMethods: PaymentMethod[] = [],
): string => {
    const methodNames = uniq(
        methodIds.flatMap((methodId) =>
            paymentMethods
                .filter(
                    (method) =>
                        method.id === methodId && isPaymentMethodAutoVaultingInstruments(method),
                )
                .map(getPaymentMethodName(language)),
        ),
    );

    return new Intl.ListFormat(language.getLocale(), { type: 'disjunction' }).format(methodNames);
};
