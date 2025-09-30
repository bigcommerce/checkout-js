import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { AddressFormSkeleton, ConfirmationModal } from '@bigcommerce/checkout/ui';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import type CheckoutStepStatus from '../checkout/CheckoutStepStatus';

import { useShipping } from './hooks/useShipping';
import { type MultiShippingFormValues } from './MultiShippingForm';
import ShippingForm from './ShippingForm';
import ShippingHeader from './ShippingHeader';
import { type SingleShippingFormValues } from './SingleShippingForm';
import StripeShipping from './stripeUPE/StripeShipping';

export interface ShippingProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    step: CheckoutStepStatus;
    onCreateAccount(): void;
    onToggleMultiShipping(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onSignIn(): void;
    navigateNextStep(isBillingSameAsShipping: boolean): void;
    setIsMultishippingMode(isMultiShippingMode: boolean): void;
}

function Shipping({
        cartHasChanged,
        navigateNextStep,
        onCreateAccount,
        onReady = noop,
        onSignIn,
        onUnhandledError = noop,
        onToggleMultiShipping = noop,
        isMultiShippingMode,
        isBillingSameAsShipping,
        setIsMultishippingMode,
        step,
    }: ShippingProps) {
    const [isInitializing, setIsInitializing] = useState(true);
    const [isMultiShippingUnavailableModalOpen, setIsMultiShippingUnavailableModalOpen] = useState(false);

    const { 
        billingAddress,
        customerMessage,
        cartHasPromotionalItems,
        consignments,
        countries,
        customer,
        deleteConsignments,
        loadShippingAddressFields,
        loadBillingAddressFields,
        loadShippingOptions,
        methodId,
        shippingAddress,
        shouldRenderStripeForm,
        shouldShowMultiShipping,
        updateCheckout,
        updateShippingAddress,
        updateBillingAddress,
    } = useShipping();

    useEffect(() => {
        const initializeShipping = async () => {
            try {
                await Promise.all([loadShippingAddressFields(), loadShippingOptions(), loadBillingAddressFields()]);

                if (cartHasPromotionalItems && isMultiShippingMode) {
                    setIsMultiShippingUnavailableModalOpen(true);
                }

                onReady();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            } finally {
                setIsInitializing(false);
            }
        };

        void initializeShipping();
    }, []);

    const handleMultiShippingModeSwitch = async () => {
        try {
            setIsInitializing(true);

            if (isMultiShippingMode && consignments.length) {
                await updateShippingAddress(consignments[0].shippingAddress);
            } else {
                await deleteConsignments();
            }
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        } finally {
            setIsInitializing(false);
        }

        onToggleMultiShipping();
    };

    const handleSwitchToSingleShipping = useCallback(async () => {
        setIsMultiShippingUnavailableModalOpen(false);
        await handleMultiShippingModeSwitch();
    }, []);

    const handleSingleShippingSubmit = async (values: SingleShippingFormValues) => {
        const updatedShippingAddress = values.shippingAddress && mapAddressFromFormValues(values.shippingAddress);
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const hasRemoteBilling = hasRemoteBillingFn(methodId);

        if (!isEqualAddress(updatedShippingAddress, shippingAddress) || shippingAddress?.shouldSaveAddress !== updatedShippingAddress?.shouldSaveAddress) {
            promises.push(updateShippingAddress(updatedShippingAddress || {}));
        }

        if (
            values.billingSameAsShipping &&
            updatedShippingAddress &&
            !isEqualAddress(updatedShippingAddress, billingAddress) &&
            !hasRemoteBilling
        ) {
            promises.push(updateBillingAddress(updatedShippingAddress));
        }

        if (customerMessage !== values.orderComment) {
            promises.push(updateCheckout({ customerMessage: values.orderComment }));
        }

        try {
            await Promise.all(promises);
            navigateNextStep(values.billingSameAsShipping);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }

    const handleMultiShippingSubmit = async (values: MultiShippingFormValues) => {
        try {
            if (customerMessage !== values.orderComment) {
                await updateCheckout({ customerMessage: values.orderComment });
            }

            navigateNextStep(false);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }

    function hasRemoteBillingFn(methodId?: string) {
        const PAYMENT_METHOD_VALID = ['amazonpay'];

        return PAYMENT_METHOD_VALID.some((method) => method === methodId);
    }

    if (shouldRenderStripeForm && !customer.email && countries.length > 0) {
        return <StripeShipping
            cartHasChanged={cartHasChanged}
            isBillingSameAsShipping={isBillingSameAsShipping}
            isInitialValueLoaded={!isInitializing}
            isInitializing={isInitializing}
            isLoading={isInitializing}
            isMultiShippingMode={isMultiShippingMode}
            onMultiShippingChange={handleMultiShippingModeSwitch}
            onSubmit={handleSingleShippingSubmit}
            onUnhandledError={onUnhandledError}
            step={step}
        />;
    }

    return (
        <AddressFormSkeleton isLoading={isInitializing} renderWhileLoading={true}>
            <div className="checkout-form">
                <ConfirmationModal
                    action={handleSwitchToSingleShipping}
                    actionButtonLabel={<TranslatedString id="common.ok_action" />}
                    headerId="shipping.multishipping_unavailable_action"
                    isModalOpen={isMultiShippingUnavailableModalOpen}
                    messageId="shipping.checkout_switched_to_single_shipping"
                    shouldShowCloseButton={false}
                />
                <ShippingHeader
                    cartHasPromotionalItems={cartHasPromotionalItems}
                    isMultiShippingMode={isMultiShippingMode}
                    onMultiShippingChange={handleMultiShippingModeSwitch}
                    shouldShowMultiShipping={shouldShowMultiShipping}
                />
                <ShippingForm
                    cartHasChanged={cartHasChanged}
                    isBillingSameAsShipping={isBillingSameAsShipping}
                    isInitialValueLoaded={!isInitializing}
                    isMultiShippingMode={isMultiShippingMode}
                    onCreateAccount={onCreateAccount}
                    onMultiShippingSubmit={handleMultiShippingSubmit}
                    onSignIn={onSignIn}
                    onSingleShippingSubmit={handleSingleShippingSubmit}
                    onUnhandledError={onUnhandledError}
                    setIsMultishippingMode={setIsMultishippingMode}
                />
            </div>
        </AddressFormSkeleton>
    );
}

export default Shipping;
