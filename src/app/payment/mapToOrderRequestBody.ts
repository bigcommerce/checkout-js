import { OrderRequestBody } from '@bigcommerce/checkout-sdk';

import { unformatCreditCardExpiryDate, unformatCreditCardNumber } from './creditCard';
import { parseUniquePaymentMethodId } from './paymentMethod';
import {
    isCreditCardFieldsetValues,
    isHostedWidgetValues,
    isInstrumentFieldsetValues,
    PaymentFormValues
} from './PaymentForm';

export default function mapToOrderRequestBody(
    values: PaymentFormValues,
    isPaymentDataRequired: boolean
): OrderRequestBody {
    const { methodId, gatewayId } = parseUniquePaymentMethodId(values.paymentProviderRadio);

    if (!isPaymentDataRequired) {
        return {
            useStoreCredit: values.useStoreCredit,
        };
    }

    if (isCreditCardFieldsetValues(values)) {
        return {
            payment: {
                gatewayId,
                methodId,
                paymentData: {
                    ccCustomerCode: values.ccCustomerCode,
                    ccCvv: values.ccCvv,
                    ccExpiry: unformatCreditCardExpiryDate(values.ccExpiry),
                    ccName: values.ccName,
                    ccNumber: unformatCreditCardNumber(values.ccNumber),
                    shouldSaveInstrument: values.shouldSaveInstrument,
                },
            },
            useStoreCredit: values.useStoreCredit,
        };
    }

    if (isInstrumentFieldsetValues(values)) {
        return {
            payment: {
                gatewayId,
                methodId,
                paymentData: {
                    instrumentId: values.instrumentId,
                    ccCvv: values.ccCvv,
                    ccNumber: values.ccNumber ? unformatCreditCardNumber(values.ccNumber) : '',
                },
            },
            useStoreCredit: values.useStoreCredit,
        };
    }

    if (isHostedWidgetValues(values)) {
        return {
            payment: {
                gatewayId,
                methodId,
                paymentData: {
                    shouldSaveInstrument: values.shouldSaveInstrument,
                },
            },
        };
    }

    return {
        payment: {
            gatewayId,
            methodId,
        },
        useStoreCredit: values.useStoreCredit,
    };
}
