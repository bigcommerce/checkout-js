import React, { type FunctionComponent } from 'react';

interface ShippingExpectationMessageProps {
    message?: string;
}

export const ShippingExpectationMessage: FunctionComponent<ShippingExpectationMessageProps> = ({
    message,
}) => {
    if (!message) {
        return null;
    }

    return <p className="shipping-ExpectationMessage">{message}</p>;
};
