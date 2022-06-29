import { OrderPaymentRequestBody, OrderRequestBody } from '@bigcommerce/checkout-sdk';
import { isEmpty, isNil, omitBy } from 'lodash';

import { unformatCreditCardExpiryDate, unformatCreditCardNumber } from './creditCard';
import { parseUniquePaymentMethodId } from './paymentMethod';
import { PaymentFormValues } from './PaymentForm';

export default function mapToOrderRequestBody(
    { paymentProviderRadio, ...values }: PaymentFormValues,
    isPaymentDataRequired: boolean
): OrderRequestBody {
    if (!isPaymentDataRequired) {
        return {};
    }

    const { methodId, gatewayId } = parseUniquePaymentMethodId(paymentProviderRadio);
    const payload: OrderRequestBody = {
        payment: { gatewayId, methodId },
    };
    const paymentData = omitBy({
        ...values,
        ccExpiry: 'ccExpiry' in values && values.ccExpiry ? unformatCreditCardExpiryDate(values.ccExpiry) : null,
        ccNumber: 'ccNumber' in values && values.ccNumber ? unformatCreditCardNumber(values.ccNumber) : null,
    }, isNil) as OrderPaymentRequestBody['paymentData'];

    if (payload.payment && !isEmpty(paymentData)) {
        payload.payment.paymentData = paymentData;
    }

    return payload;
}
