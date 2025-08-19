import React, { type FunctionComponent, useCallback, useEffect } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { Fieldset, Legend } from '@bigcommerce/checkout/ui';

import { isBlueSnapDirectInitializationData } from './BlueSnapDirectInitializationData';
import BlueSnapDirectTextField from './fields/BlueSnapDirectTextField';
import getPayByBankValidationSchema from './validation-schemas/getPayByBankValidationSchema';

const BlueSnapDirectPayByBankPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    language,
    paymentForm: { setValidationSchema },
    checkoutService: { initializePayment, deinitializePayment },
}) => {
    if (!isBlueSnapDirectInitializationData(method.initializationData)) {
        throw new Error('Unable to get initialization data');
    }

    const initializePayByBank = useCallback(async () => {
        setValidationSchema(method, getPayByBankValidationSchema(language));

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, language, method, setValidationSchema]);

    const deinitializePayByBank = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializePayByBank();

        return () => {
            void deinitializePayByBank();
        };
    }, [deinitializePayByBank, initializePayByBank]);

    return (
        <Fieldset
            legend={
                <Legend hidden>{language.translate('payment.bluesnap_direct_iban.label')}</Legend>
            }
            style={{ paddingBottom: '1rem' }}
        >
            <BlueSnapDirectTextField
                autoComplete="iban"
                labelContent={language.translate('payment.bluesnap_direct_iban.label')}
                name="iban"
                useFloatingLabel={true}
            />
        </Fieldset>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectPayByBankPaymentMethod,
    [{ id: 'pay_by_bank', gateway: 'bluesnapdirect' }],
);
