import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { OrderPaymentRequestBody, OrderRequestBody } from '@bigcommerce/checkout-sdk';
import { isEmpty, isNil, omitBy } from 'lodash';

import { unformatCreditCardExpiryDate, unformatCreditCardNumber } from './creditCard';
import { hasCreditCardExpiry, parseUniquePaymentMethodId } from './paymentMethod';
import { hasCreditCardNumber } from './paymentMethod';

export default function mapToOrderRequestBody(
    values: PaymentFormValues,
    isPaymentDataRequired: boolean
): OrderRequestBody {
    if (!isPaymentDataRequired) {
        return {};
    }

    const { paymentProviderRadio, ...rest } = values;
    const { methodId, gatewayId } = parseUniquePaymentMethodId(paymentProviderRadio);
    const payload: OrderRequestBody = {
        payment: { gatewayId, methodId },
    };
    const paymentData = omitBy({
        ...rest,
        ccExpiry: hasCreditCardExpiry(values) ? unformatCreditCardExpiryDate(values.ccExpiry) : null,
        ccNumber: hasCreditCardNumber(values) ? unformatCreditCardNumber(values.ccNumber) : null,
    }, isNil) as OrderPaymentRequestBody['paymentData'];

    if (payload.payment && !isEmpty(paymentData)) {
        payload.payment.paymentData = paymentData;
    }

    return payload;
}
