import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import BlueSnapDirectEcpFieldset from './BlueSnapDirectEcpFieldset';
import getEcpValidationSchema from './validation-schemas/getEcpValidationSchema';

const BlueSnapDirectEcpPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    checkoutState: {
        data: { isPaymentDataRequired },
    },
    paymentForm: { disableSubmit, setValidationSchema },
    language,
}) => {
    const [disabled, setDisabled] = useState(true);
    const onChange = useCallback(
        (shopperPermission: boolean) => setDisabled(!shopperPermission),
        [setDisabled],
    );

    useEffect(
        () => disableSubmit(method, isPaymentDataRequired() && disabled),
        [disableSubmit, disabled, isPaymentDataRequired, method],
    );

    const initializeEcp = useCallback(async () => {
        setValidationSchema(method, getEcpValidationSchema(language));

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method, setValidationSchema, language]);

    const deinitializeEcp = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeEcp();

        return () => {
            void deinitializeEcp();
        };
    }, [deinitializeEcp, initializeEcp]);

    return <BlueSnapDirectEcpFieldset language={language} onPermissionChange={onChange} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectEcpPaymentMethod,
    [{ id: 'ecp', gateway: 'bluesnapdirect' }],
);
