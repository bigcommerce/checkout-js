import React, { FunctionComponent, useContext, useEffect, useRef } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import AccordionContext from '../../ui/accordion/AccordionContext';

import PaymentMethodId from './PaymentMethodId';

const StripeUPEDescription: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    // return null;
    const { checkoutService } = useCheckout();
    const { onToggle, selectedItemId } = useContext(AccordionContext);
    const containerId = `stripe-new-upe-component-field`;
    const render = () => {};
    const collapseStripeElement = useRef<() => void>();

    const collapseListener = (collapseElement: () => void) => {
        collapseStripeElement.current = collapseElement;
    };

    const toggleSelectedMethod = (id: string) => {
        onToggle(id);
    };

    useEffect(() => {
        console.log('initializePayment StripeUPEDescription');

        const initMEthod = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: PaymentMethodId.StripeUPE,
                    methodId: 'card',
                    stripeupe: {
                        containerId,
                        render,
                        toggleSelectedMethod,
                        collapseListener,
                    },
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError?.(error);
                }
            }
        };

        initMEthod();

        return () => {
            checkoutService.deinitializePayment({
                gatewayId: PaymentMethodId.StripeUPE,
                methodId: 'card',
            });
        };
    }, []);

    useEffect(() => {
        if (selectedItemId?.includes('stripeupe')) {
            return;
        }

        collapseStripeElement.current?.();
    }, [selectedItemId]);

    const addStyles = () => (
        <>
            <style>
                {`
                    .form-checklist-item:has(#${containerId}) .{
                        border-bottom: none !important;
                    }

                    .form-checklist-item:has(#${containerId}) .form-checklist-body {
                        margin: 0 !important;
                    }

                    .form-checklist-item:has(#${containerId}) .payment-widget,
                    .form-checklist-item:has(#${containerId}) .paymentMethod--hosted,
                    .form-checklist-item:has(#${containerId}) .form-label {
                        padding: 0 !important;
                    }
                    
                    .form-checklist-item:has(#${containerId})  .paymentProviderHeader-container {
                        display: block;
                        // padding: 20px;
                    }

                    .form-checklist-item:has(#${containerId}) .form-label::before,
                    .form-checklist-item:has(#${containerId}) .form-label::after,
                    .form-checklist-item:has(#${containerId}) .paymentProviderHeader-name,
                    .form-checklist-item:has(#${containerId}) .paymentProviderHeader-img,
                    .form-checklist-item:has(#${containerId}):has([value^="stripeupe"]:not([value="stripeupe-card"])) {
                        display: none;
                    }
                `}
            </style>
        </>
    );

    return (
        <>
            <div data-test={containerId} id={containerId} />

            {addStyles()}
        </>
    )
}

export default StripeUPEDescription;
