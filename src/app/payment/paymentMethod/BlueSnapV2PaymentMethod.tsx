import React, { FunctionComponent } from 'react';

import ModalPaymentMethod, { ModalPaymentMethodProps } from './ModalPaymentMethod';

const BlueSnapV2PaymentMethod: FunctionComponent<ModalPaymentMethodProps> = ({
    ...rest
}) => (
    <ModalPaymentMethod
        { ...rest }
    />
);

export default BlueSnapV2PaymentMethod;
