import React, { type ReactNode } from 'react';

interface PaymentDescriptorProps {
    paymentDescriptor: string | undefined;
    shouldShowDescriptor: boolean | undefined;
}

export const PaymentDescriptor = ({
    shouldShowDescriptor,
    paymentDescriptor,
}: PaymentDescriptorProps): ReactNode => {
    if (shouldShowDescriptor && paymentDescriptor) {
        return <div className="payment-descriptor">{paymentDescriptor}</div>;
    }

    return null;
};
