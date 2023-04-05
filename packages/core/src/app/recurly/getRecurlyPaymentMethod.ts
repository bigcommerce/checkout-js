import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import {recurlyId} from "./config";

export default function getRecurlyPaymentMethod() {
    const recurlyMethod: PaymentMethod = {
        id: 'card',
        gateway: 'recurly',
        logoUrl: '',
        method: 'card',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
            'DISCOVER',
            'JCB',
            'DINERS',
        ],
        config: {
            displayName: 'Credit Card',
            cardCode: true,
            helpText: '',
            testMode: true,
            requireCustomerCode: false,
            isVaultingEnabled: false,
            isVaultingCvvEnabled: false,
            hasDefaultStoredInstrument: false,
            isHostedFormEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationStrategy: {
            type: 'not_applicable',
        },
        initializationData: {
            recurlyKey: recurlyId,
            gateway: 'recurly',
            useIndividualCardFields: true,
        },
    };

    return recurlyMethod;
}
