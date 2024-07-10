import React, { FunctionComponent, useContext, useEffect, useRef, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import AccordionContext from '../../ui/accordion/AccordionContext';

import PaymentMethodId from './PaymentMethodId';

const StripeUPEDescription: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    const [isAccordionView, setIsAccordionView] = useState(false);
    const { checkoutService } = useCheckout();
    const { onToggle, selectedItemId } = useContext(AccordionContext);
    const containerId = `stripe-new-upe-component-field`;
    const render = (newIsAccordionView?: boolean) => {
        console.log('*** render newIsAccordionView - ', newIsAccordionView);
        setIsAccordionView(!!newIsAccordionView);
    };
    const collapseStripeElement = useRef<() => void>();

    const collapseListener = (collapseElement: () => void) => {
        collapseStripeElement.current = collapseElement;
    };

    useEffect(() => {
        console.log('initializePayment StripeUPEDescription');

        try {
            checkoutService.initializePayment({
                gatewayId: PaymentMethodId.StripeUPE,
                methodId: 'card',
                stripeupe: {
                    containerId,
                    isAccordionView: true,
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
    }, []);

    useEffect(() => {
        if (selectedItemId?.includes('stripeupe')) {
            return;
        }

        collapseStripeElement.current?.();
    }, [selectedItemId]);

    const toggleSelectedMethod = (id: string) => {
        onToggle(id);
    };

    const addStyles = () => (
        <>
            <style>
                {`
                    .form-checklist-item:has(#${containerId}) .form-label {
                        padding: 0;
                    }
                    
                    .form-checklist-item:has(#${containerId})  .paymentProviderHeader-container {
                        display: block;
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

            {!!isAccordionView && addStyles()}
        </>
    )
}

export default StripeUPEDescription;
