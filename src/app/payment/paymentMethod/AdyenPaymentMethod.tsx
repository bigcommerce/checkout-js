import { CardComponentOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type AdyenPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

export interface AdyenOptions {
    scheme: CardComponentOptions;
    bcmc: CardComponentOptions;
}

export enum AdyenMethodType {
    scheme = 'scheme',
    bcmc = 'bcmc',
}

const AdyenPaymentMethod: FunctionComponent<AdyenPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const containerId = `${method.id}-adyen-component-field`;
    const component: AdyenMethodType = AdyenMethodType[method.method as keyof typeof AdyenMethodType];
    const adyenOptions: AdyenOptions = {
        [AdyenMethodType.scheme]: {
            hasHolderName: true,
        },
        [AdyenMethodType.bcmc]: {
            hasHolderName: false,
        },
    };

    return <HostedWidgetPaymentMethod
        {...rest}
        containerId= { containerId }
        hideContentWhenSignedOut
        method={ method }
        initializePayment={ options => initializePayment({
            ...options,
            adyenv2: {
                containerId,
                options: adyenOptions[component],
                threeDS2ChallengeWidgetSize: '01',
            },
        })}
    />;
};

export default AdyenPaymentMethod;
