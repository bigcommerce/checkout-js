import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField, Fieldset, Legend } from '@bigcommerce/checkout/ui';

import BlueSnapDirectTextField from './BlueSnapDirectTextField';
import getSepaValidationSchema from './validation-schemas/getSepaValidationSchema';

interface BlueSnapDirectInitializationData {
    sepaCreditorCompanyName: string;
}

const isBlueSnapDirectInitializationData = (
    object: unknown,
): object is BlueSnapDirectInitializationData => {
    if (
        !(
            typeof object === 'object' &&
            object !== null &&
            'sepaCreditorCompanyName' in object &&
            typeof object.sepaCreditorCompanyName === 'string'
        )
    ) {
        return false;
    }

    return true;
};

const BlueSnapDirectSepaPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    checkoutState: {
        data: { isPaymentDataRequired },
    },
    paymentForm: { disableSubmit, setValidationSchema },
    language,
}) => {
    if (!isBlueSnapDirectInitializationData(method.initializationData)) {
        throw new Error('Unable to get initialization data');
    }

    const [disabled, setDisabled] = useState(true);
    const toggleSubmitButton = useCallback(
        (shopperPermission: boolean) => setDisabled(!shopperPermission),
        [setDisabled],
    );

    useEffect(
        () => disableSubmit(method, isPaymentDataRequired() && disabled),
        [disableSubmit, disabled, isPaymentDataRequired, method],
    );

    const initializeSepa = useCallback(async () => {
        setValidationSchema(method, getSepaValidationSchema(language));

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method, setValidationSchema, language]);

    const deinitializeSepa = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeSepa();

        return () => {
            void deinitializeSepa();
        };
    }, [deinitializeSepa, initializeSepa]);

    return (
        <Fieldset
            legend={
                <Legend hidden>
                    {language.translate('payment.bluesnap_direct_sepa_direct_debit')}
                </Legend>
            }
            style={{ paddingBottom: '1rem' }}
        >
            <BlueSnapDirectTextField
                autoComplete="iban"
                labelContent={language.translate('payment.bluesnap_direct_iban.label')}
                name="iban"
                useFloatingLabel={true}
            />
            <BlueSnapDirectTextField
                labelContent={language.translate('address.first_name_label')}
                name="firstName"
                useFloatingLabel={true}
            />
            <BlueSnapDirectTextField
                labelContent={language.translate('address.last_name_label')}
                name="lastName"
                useFloatingLabel={true}
            />

            <CheckboxFormField
                labelContent={language.translate(
                    'payment.bluesnap_direct_sepa_mandate_disclaimer',
                    {
                        creditorName: method.initializationData.sepaCreditorCompanyName,
                    },
                )}
                name="shopperPermission"
                onChange={toggleSubmitButton}
            />
        </Fieldset>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectSepaPaymentMethod,
    [{ id: 'sepa_direct_debit', gateway: 'bluesnapdirect' }],
);
