import { CardComponentOptions, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
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

const AdyenPaymentMethodV2: FunctionComponent<AdyenPaymentMethodProps> = ({
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

    const initializeAdyenPayment = useCallback((options: PaymentInitializeOptions) => {
        return initializePayment({
            ...options,
            adyenv2: {
                containerId,
                options: adyenOptions[component],
                threeDS2ChallengeWidgetSize: '01',
            },
        });
    }, [initializePayment, containerId, component, adyenOptions]);

    return <HostedWidgetPaymentMethod
        {...rest}
        containerId= { containerId }
        hideContentWhenSignedOut
        method={ method }
        initializePayment={ initializeAdyenPayment }
    />;
};

export default AdyenPaymentMethodV2;
