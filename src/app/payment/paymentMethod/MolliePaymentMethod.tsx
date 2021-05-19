import React, { useCallback, FunctionComponent } from 'react';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
import MollieCustomCardForm from './MollieCustomCardForm';

export type MolliePaymentMethodsProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

export enum MolliePaymentMethodType {
    creditcard = 'credit_card',
}

const MolliePaymentMethod: FunctionComponent<MolliePaymentMethodsProps> = ({ initializePayment, method, ...props }) => {

    const containerId = `mollie-${method.method}`;
    const initializeMolliePayment: HostedWidgetPaymentMethodProps['initializePayment'] = useCallback(options => {
        const mollieElements = getMolliesElementOptions();

        return initializePayment({
            ...options,
            mollie: {
                containerId,
                cardNumberId : mollieElements.cardNumberElementOptions.containerId,
                cardCvcId: mollieElements.cardCvcElementOptions.containerId,
                cardHolderId: mollieElements.cardHolderElementOptions.containerId,
                cardExpiryId: mollieElements.cardExpiryElementOptions.containerId,
                styles : {
                    base: {
                        color: '#333333',
                        '::placeholder' : {
                            color: '#999999',
                        },
                    },
                    valid: {
                        color: '#090',
                    },
                    invalid: {
                        color: '#D14343',
                    },
                },
            },
        });
    }, [initializePayment, containerId]);

    const getMolliesElementOptions = () => {

        return {
            cardNumberElementOptions: {
                containerId: 'mollie-card-number-component-field',
            },
            cardExpiryElementOptions: {
                containerId: 'mollie-card-expiry-component-field',
            },
            cardCvcElementOptions: {
                containerId: 'mollie-card-cvc-component-field',
            },
            cardHolderElementOptions: {
                containerId: 'mollie-card-holder-component-field',
            },
        };
    };

    function renderCustomPaymentForm() {
        const options = getMolliesElementOptions();

        return <MollieCustomCardForm isCreditCard={ isCreditCard() } method={ method } options={ options } />;
    }

    function isCreditCard(): boolean {
        return method.method === MolliePaymentMethodType.creditcard;
    }

    return (
        <HostedWidgetPaymentMethod
            { ...props }
            containerId={ containerId }
            hideContentWhenSignedOut
            hideVerificationFields={ true }
            initializePayment={ initializeMolliePayment }
            isAccountInstrument={ !isCreditCard() }
            method={ method }
            renderCustomPaymentForm={ renderCustomPaymentForm }
            shouldRenderCustomInstrument={ true }
        />);
};

export default MolliePaymentMethod;
