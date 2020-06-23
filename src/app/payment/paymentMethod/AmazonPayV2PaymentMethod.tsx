import { CheckoutSelectors, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod , { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export interface AmazonPayV2PaymentMethodProps extends Omit<HostedWidgetPaymentMethodProps, 'buttonId' | 'containerId' | 'hideWidget' | 'isSignInRequired' | 'paymentDescriptor' | 'shouldShowDescriptor' | 'shouldShowEditButton'> {
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
}

const AmazonPayV2PaymentMethod: FunctionComponent<AmazonPayV2PaymentMethodProps> = ({
    initializePayment,
    method,
    method: { initializationData: { paymentDescriptor, paymentToken } },
    ...rest
}) => {
    const initializeAmazonPayV2Payment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        amazonpay: {
            editButtonId: 'editButtonId',
        },
    }), [initializePayment]);

    const reload = useCallback(() => window.location.reload(), []);

    return <HostedWidgetPaymentMethod
        { ...rest }
        buttonId="editButtonId"
        containerId="paymentWidget"
        deinitializeCustomer={ undefined }
        hideWidget
        initializeCustomer={ undefined }
        initializePayment={ initializeAmazonPayV2Payment }
        isSignInRequired={ false }
        method={ method }
        onSignOut={ reload }
        paymentDescriptor={ paymentDescriptor }
        shouldShowDescriptor={ !!paymentToken }
        shouldShowEditButton={ !!paymentToken }
    />;
};

export default AmazonPayV2PaymentMethod;
