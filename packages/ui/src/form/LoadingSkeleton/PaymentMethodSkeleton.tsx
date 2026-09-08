import React, { type FunctionComponent } from 'react';

export const PaymentMethodSkeleton: FunctionComponent = () => (
    <div
        aria-busy="true"
        className="payment-method-skeleton"
        data-test="payment-method-skeleton"
        role="status"
    >
        <div className="payment-method-skeleton--label" />
        <div className="payment-method-skeleton--fields">
            <div className="payment-method-skeleton--field-large" />
            <div className="payment-method-skeleton--field-small" />
        </div>
        <div className="payment-method-skeleton--label" />
        <div className="payment-method-skeleton--fields">
            <div className="payment-method-skeleton--field-large" />
            <div className="payment-method-skeleton--field-small" />
        </div>
    </div>
);
