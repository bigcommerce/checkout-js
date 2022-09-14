import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { createContext } from 'react';
import { ObjectSchema } from 'yup';

import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

export interface PaymentContextProps {
    disableSubmit(method: PaymentMethod, disabled?: boolean): void;
    // NOTE: This prop allows certain payment methods to override the default
    // form submission behaviour. It is not recommended to use it because
    // generally speaking we want to avoid method-specific snowflake behaviours.
    // Nevertheless, because of some product / UX decisions made in the past
    // (i.e.: Amazon), we have to have this backdoor so we can preserve these
    // snowflake behaviours. In the future, if we decide to change the UX, we
    // can remove this prop.
    setSubmit(method: PaymentMethod, fn: ((values: PaymentFormValues) => void) | null): void;
    setValidationSchema(
        method: PaymentMethod,
        schema: ObjectSchema<Partial<PaymentFormValues>> | null,
    ): void;
    hidePaymentSubmitButton(method: PaymentMethod, hidden?: boolean): void;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export default PaymentContext;
