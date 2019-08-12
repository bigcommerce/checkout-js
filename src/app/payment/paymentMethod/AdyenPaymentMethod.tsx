import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type AdyenPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

const AdyenPaymentMethod: FunctionComponent<AdyenPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => (
    <HostedWidgetPaymentMethod
        {...rest}
        containerId="adyen-component-field"
        hideContentWhenSignedOut
        initializePayment={ options => initializePayment({
            ...options,
            adyenv2: {
                containerId: 'adyen-component-field',
                options: {
                    hasHolderName: true,
                    styles: {},
                    placeholders: {},
                },
                threeDS2ChallengeWidgetSize: '01',
            },
        })}
    />
);

export default AdyenPaymentMethod;
