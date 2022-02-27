import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { withLanguage, TranslatedString, WithLanguageProps } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';

import getPaymentMethodName from './getPaymentMethodName';
import HostedWidgetPaymentMethod , { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type OpyPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const OpyPaymentMethod: FunctionComponent<OpyPaymentMethodProps & WithLanguageProps> = ({
    initializePayment,
    method,
    language,
    isInitializing = false,
    ...rest
}) => {
    const containerId = 'learnMoreButton';
    const initializeOpyPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        opy: {
            containerId,
        },
    }), [initializePayment]);

    return (
      <LoadingOverlay hideContentWhenLoading isLoading={ isInitializing }>
        <strong>
            <TranslatedString id="payment.opy_widget_slogan" />
        </strong>
        <div style={ { display: 'inline-block', marginLeft: '0.5rem' } }>
            <HostedWidgetPaymentMethod
                { ...rest }
                containerId={ containerId }
                hideWidget={ isInitializing }
                initializePayment={ initializeOpyPayment }
                method={ method }
            />
        </div>
        <p>
            <TranslatedString
                data={ { methodName: getPaymentMethodName(language)(method) } }
                id="payment.opy_widget_info"
            />
        </p>
      </LoadingOverlay>
    );
};

export default withLanguage(OpyPaymentMethod);
