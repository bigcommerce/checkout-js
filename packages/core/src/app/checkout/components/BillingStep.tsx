import { type Address } from '@bigcommerce/checkout-sdk/essential';
import React, { lazy } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, LazyContainer } from '@bigcommerce/checkout/ui';

import { StaticBillingAddress } from '../../billing';
import { retry } from '../../common/utility';
import CheckoutStep from '../CheckoutStep';
import type CheckoutStepStatus from '../CheckoutStepStatus';
import type CheckoutStepType from '../CheckoutStepType';

const Billing = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "billing" */
                '../../billing/Billing'
            ),
    ),
);

export interface BillingStepProps {
    step: CheckoutStepStatus;
    billingAddress?: Address;
    onEdit(type: CheckoutStepType): void;
    onExpanded(type: CheckoutStepType): void;
    navigateNextStep(options?: { isDefault?: boolean }): void;
    onReady(): void;
    onUnhandledError(error: Error): void;
}

const BillingStep: React.FC<BillingStepProps> = ({
    step,
    billingAddress,
    onEdit,
    onExpanded,
    navigateNextStep,
    onReady,
    onUnhandledError,
}) => {
    return (
        <CheckoutStep
            {...step}
            heading={<TranslatedString id="billing.billing_heading" />}
            key={step.type}
            onEdit={onEdit}
            onExpanded={onExpanded}
            summary={billingAddress && <StaticBillingAddress address={billingAddress} />}
        >
            <LazyContainer loadingSkeleton={<AddressFormSkeleton />}>
                <Billing
                    navigateNextStep={navigateNextStep}
                    onReady={onReady}
                    onUnhandledError={onUnhandledError}
                />
            </LazyContainer>
        </CheckoutStep>
    );
};

export default BillingStep;

