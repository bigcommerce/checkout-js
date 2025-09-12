import {
    type CardInstrument,
    type CheckoutSelectors,
    type LegacyHostedFormOptions,
    type PaymentInitializeOptions,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { type ReactNode } from 'react';
import { type ObjectSchema } from 'yup';

import { type CreditCardFieldsetValues } from '@bigcommerce/checkout/instrument-utils';
import { type CardInstrumentFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

export interface CreditCardPaymentMethodProps {
    cardFieldset?: ReactNode;
    cardValidationSchema?: ObjectSchema;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    storedCardValidationSchema?: ObjectSchema;

    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrument?: CardInstrument,
    ): Promise<CheckoutSelectors>;

    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;

    getHostedFormOptions?(selectedInstrument?: CardInstrument): Promise<LegacyHostedFormOptions>;

    getStoredCardValidationFieldset?(selectedInstrument?: CardInstrument): ReactNode;
}

export type CreditCardPaymentMethodValues = CreditCardFieldsetValues | CardInstrumentFieldsetValues;
