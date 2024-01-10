import React, { FunctionComponent, useCallback, useEffect } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { Fieldset, Legend } from '@bigcommerce/checkout/ui';

import { isBlueSnapDirectInitializationData } from './BlueSnapDirectInitializationData';
import BlueSnapDirectSelectField from './fields/BlueSnapDirectSelectField';
import getIdealValidationSchema from './validation-schemas/getIdealValidationSchema';

const BlueSnapDirectIdealPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    paymentForm: { setValidationSchema },
    language,
}) => {
    if (!isBlueSnapDirectInitializationData(method.initializationData)) {
        throw new Error('Unable to get initialization data');
    }

    const { idealIssuers } = method.initializationData;

    const idealIssuersSelectOptions = idealIssuers.map((issuer) => ({
        value: issuer.issuerId,
        label: issuer.issuerName,
    }));

    const initializeIdeal = useCallback(async () => {
        setValidationSchema(method, getIdealValidationSchema(language));

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method, setValidationSchema, language]);

    const deinitializeIdeal = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeIdeal();

        return () => {
            void deinitializeIdeal();
        };
    }, [deinitializeIdeal, initializeIdeal]);

    return (
        <Fieldset
            legend={<Legend hidden>{language.translate('payment.ideal.label')}</Legend>}
            style={{ paddingBottom: '1rem' }}
        >
            <BlueSnapDirectSelectField
                labelContent={language.translate('payment.ideal.label')}
                name="bic"
                options={{
                    helperLabel: language.translate('payment.select_your_bank'),
                    items: idealIssuersSelectOptions,
                }}
            />
        </Fieldset>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectIdealPaymentMethod,
    [{ id: 'ideal', gateway: 'bluesnapdirect' }],
);
