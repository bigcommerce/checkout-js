import { type CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createBoltCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bolt';
import React, { type FunctionComponent, useCallback, useState } from 'react';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

import BoltCustomForm from './BoltCustomForm';

const BoltEmbeddedPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const [showCreateAccountCheckbox, setShowCreateAccountCheckbox] = useState(false);

    const boltEmbeddedContainerId = 'bolt-embedded';

    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;

    const initializeBoltPayment = useCallback(
        (options: any) =>
            checkoutService.initializePayment({
                ...options,
                bolt: {
                    containerId: boltEmbeddedContainerId,
                    useBigCommerceCheckout: true,
                    onPaymentSelect: (hasBoltAccount: boolean) => {
                        setShowCreateAccountCheckbox(!hasBoltAccount);

                        if (hasBoltAccount) {
                            setFieldValue('shouldCreateAccount', false);
                        }
                    },
                },
            }),
        [checkoutService, boltEmbeddedContainerId, setFieldValue],
    );

    const initializeBoltCustomer = useCallback(
        (options: CustomerInitializeOptions) => {
            return checkoutService.initializeCustomer({
                ...options,
                integrations: [createBoltCustomerStrategy],
            });
        },
        [checkoutService],
    );

    const renderCustomPaymentForm = useCallback(
        () => (
            <BoltCustomForm
                containerId={boltEmbeddedContainerId}
                showCreateAccountCheckbox={showCreateAccountCheckbox}
            />
        ),
        [boltEmbeddedContainerId, showCreateAccountCheckbox],
    );

    const { getInstruments, isPaymentDataRequired } = checkoutState.data;
    const { isInitializingPayment, isLoadingInstruments } = checkoutState.statuses;
    const instruments = getInstruments(method) || [];
    const customer = checkoutState.data.getCustomer();
    const isGuestCustomer = customer?.isGuest;
    const isInstrumentFeatureAvailable =
        !isGuestCustomer && Boolean(method.config.isVaultingEnabled);

    return (
        <HostedWidgetPaymentComponent
            containerId="boltEmbeddedOneClick"
            deinitializePayment={checkoutService.deinitializePayment}
            disableSubmit={disableSubmit}
            hidePaymentSubmitButton={hidePaymentSubmitButton}
            initializeCustomer={initializeBoltCustomer}
            initializePayment={initializeBoltPayment}
            instruments={instruments}
            isInitializing={isInitializingPayment()}
            isInstrumentCardCodeRequired={isInstrumentCardCodeRequiredSelector(checkoutState)}
            isInstrumentCardNumberRequired={isInstrumentCardNumberRequiredSelector(checkoutState)}
            isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
            isLoadingInstruments={isLoadingInstruments()}
            isPaymentDataRequired={isPaymentDataRequired()}
            isSignedIn={!isGuestCustomer}
            loadInstruments={checkoutService.loadInstruments}
            method={method}
            renderCustomPaymentForm={renderCustomPaymentForm}
            setFieldValue={setFieldValue}
            setSubmit={setSubmit}
            setValidationSchema={setValidationSchema}
            shouldRenderCustomInstrument
            signOut={checkoutService.signOutCustomer}
            {...rest}
        />
    );
};

export default BoltEmbeddedPaymentMethod;
