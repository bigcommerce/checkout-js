import type { Cart, Consignment } from '@bigcommerce/checkout-sdk/essential';
import React, { lazy ,type  ReactElement } from 'react';

import type { ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ChecklistSkeleton, LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import { isEmbedded } from '../../embeddedCheckout';
import { type PaymentProps } from '../../payment';
import { isUsingMultiShipping } from '../../shipping';
import CheckoutStep from '../CheckoutStep';
import type CheckoutStepStatus from '../CheckoutStepStatus';
import type CheckoutStepType from '../CheckoutStepType';

const Payment = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "payment" */
                '../../payment/Payment'
            ),
    ),
);

export interface PaymentStepProps extends PaymentProps {
    step: CheckoutStepStatus;
    cart?: Cart;
    consignments?: Consignment[];
    errorLogger: ErrorLogger;
    onEdit(type: CheckoutStepType): void;
    onExpanded(type: CheckoutStepType): void;
}

const PaymentStep = ({
    step,
    cart,
    consignments,
    errorLogger,
    onEdit,
    onExpanded,
    checkEmbeddedSupport,
    onCartChangedError,
    onFinalize,
    onReady,
    onSubmit,
    onSubmitError,
    onUnhandledError,
}: PaymentStepProps): ReactElement => (
    <CheckoutStep
        {...step}
        heading={<TranslatedString id="payment.payment_heading" />}
        key={step.type}
        onEdit={onEdit}
        onExpanded={onExpanded}
    >
        <LazyContainer loadingSkeleton={<ChecklistSkeleton />}>
            <Payment
                checkEmbeddedSupport={checkEmbeddedSupport}
                errorLogger={errorLogger}
                isEmbedded={isEmbedded()}
                isUsingMultiShipping={
                    cart && consignments ? isUsingMultiShipping(consignments, cart.lineItems) : false
                }
                onCartChangedError={onCartChangedError}
                onFinalize={onFinalize}
                onReady={onReady}
                onSubmit={onSubmit}
                onSubmitError={onSubmitError}
                onUnhandledError={onUnhandledError}
            />
        </LazyContainer>
    </CheckoutStep>
);

export default PaymentStep;

