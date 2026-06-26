import { type OrderPaymentRequestBody, type OrderRequestBody } from '@bigcommerce/checkout-sdk';
import { isEmpty, isNil, omitBy } from 'lodash';

import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { unformatCreditCardExpiryDate, unformatCreditCardNumber } from './creditCard';
import {
    hasCreditCardExpiry,
    hasCreditCardNumber,
    parseUniquePaymentMethodId,
} from './paymentMethod';

export default function mapToOrderRequestBody(
    values: PaymentFormValues,
    isPaymentDataRequired: boolean,
): OrderRequestBody {
    if (!isPaymentDataRequired) {
        return {};
    }

    // `selectedSubMethodId` is a READ-ONLY channel used only for the STRIPE-1525
    // timing signal (consumed by `Payment.tsx handleSubmit`). It must never be
    // included in the submitted order body, so it is destructured out here.
    const { paymentProviderRadio, methodIdOverride, selectedSubMethodId, ...rest } = values;
    const { methodId: baseMethodId, gatewayId } = parseUniquePaymentMethodId(paymentProviderRadio);
    const methodId =
        typeof methodIdOverride === 'string' ? methodIdOverride || baseMethodId : baseMethodId;
    const payload: OrderRequestBody = {
        payment: { gatewayId, methodId },
    };
    const paymentData = omitBy(
        {
            ...rest,
            ccExpiry: hasCreditCardExpiry(values)
                ? unformatCreditCardExpiryDate(values.ccExpiry)
                : null,
            ccNumber: hasCreditCardNumber(values)
                ? unformatCreditCardNumber(values.ccNumber)
                : null,
        },
        isNil,
    ) as OrderPaymentRequestBody['paymentData'];

    if (payload.payment && !isEmpty(paymentData)) {
        payload.payment.paymentData = paymentData;
    }

    return payload;
}
