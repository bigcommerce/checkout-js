import { some } from 'lodash';
import React, { FunctionComponent, useCallback } from 'react';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const KlarnaV2PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const initializeKlarnaV2Payment = useCallback(
        (options) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            checkoutService.initializePayment({
                ...options,
                klarnav2: {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                    container: `#${options.methodId}Widget`,
                },
            }),
        [checkoutService],
    );

    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;

    const instruments = checkoutState.data.getInstruments(method) || [];

    const {
        data: { getCheckout, isPaymentDataRequired },
        statuses: { isLoadingInstruments },
    } = checkoutState;

    const checkout = getCheckout();
    const customer = checkoutState.data.getCustomer();
    const isGuestCustomer = customer?.isGuest;
    const isInstrumentFeatureAvailable =
        !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    return (
        <HostedWidgetPaymentComponent
            containerId={`${method.id}Widget`}
            deinitializePayment={checkoutService.deinitializePayment}
            disableSubmit={disableSubmit}
            hidePaymentSubmitButton={hidePaymentSubmitButton}
            initializePayment={initializeKlarnaV2Payment}
            instruments={instruments}
            isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
            isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(checkoutState)}
            isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
            isLoadingInstruments={isLoadingInstruments()}
            isPaymentDataRequired={isPaymentDataRequired()}
            isSignedIn={some(checkout?.payments, { providerId: method.id })}
            loadInstruments={checkoutService.loadInstruments}
            method={method}
            setFieldValue={setFieldValue}
            setSubmit={setSubmit}
            setValidationSchema={setValidationSchema}
            signOut={checkoutService.signOutCustomer}
            {...rest}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    KlarnaV2PaymentMethod,
    [{ gateway: 'klarna' }],
);
