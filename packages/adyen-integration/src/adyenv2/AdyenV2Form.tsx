import { CardInstrument } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import {
    HostedWidgetComponentProps,
    HostedWidgetPaymentComponent,
} from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { PaymentMethodProps, useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

export type AdyenV2FormProps = Omit<
    HostedWidgetComponentProps,
    | 'onSignOut'
    | 'isInstrumentFeatureAvailable'
    | 'instruments'
    | 'isLoadingInstruments'
    | 'isPaymentDataRequired'
    | 'isSignedIn'
    | 'isInstrumentCardCodeRequired'
    | 'isInstrumentCardNumberRequired'
    | 'loadInstruments'
    | 'signOut'
    | 'deinitializePayment'
> & {
    containerId: string;
    isAccountInstrument: boolean;
    shouldHideInstrumentExpiryDate: boolean;
    validateInstrument: (
        shouldShowNumberField: boolean,
        selectedInstrument: CardInstrument,
    ) => React.JSX.Element;
    showAdditionalActionContent: boolean;
    cancelAdditionalActionModalFlow: () => void;
    additionalActionContainerId: string;
};

const AdyenV2Form: FunctionComponent<AdyenV2FormProps & PaymentMethodProps> = ({
    method,
    containerId,
    initializePayment,
    isAccountInstrument,
    shouldHideInstrumentExpiryDate,
    validateInstrument,
    language,
    showAdditionalActionContent,
    cancelAdditionalActionModalFlow,
    additionalActionContainerId,
    onUnhandledError,
    checkoutService,
    checkoutState,
    paymentForm,
    ...rest
}) => {
    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;
    const customer = checkoutState.data.getCustomer();
    const { isLoadingInstruments } = checkoutState.statuses;

    const instruments = checkoutState.data.getInstruments(method) || [];

    const {
        checkoutState: {
            data: { isPaymentDataRequired },
        },
    } = useCheckout();
    const isSignedIn = customer?.isGuest;
    const isInstrumentFeatureAvailable = !isSignedIn && Boolean(method.config.isVaultingEnabled);
    const isInstrumentCardCodeRequired = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequired = isInstrumentCardNumberRequiredSelector(checkoutState);

    return (
        <>
            <HostedWidgetPaymentComponent
                {...rest}
                containerId={containerId}
                deinitializePayment={checkoutService.deinitializePayment}
                disableSubmit={disableSubmit}
                hideContentWhenSignedOut
                hidePaymentSubmitButton={hidePaymentSubmitButton}
                initializePayment={initializePayment}
                instruments={instruments}
                isAccountInstrument={isAccountInstrument}
                isInstrumentCardCodeRequired={isInstrumentCardCodeRequired}
                isInstrumentCardNumberRequired={isInstrumentCardNumberRequired}
                isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
                isLoadingInstruments={isLoadingInstruments()}
                isPaymentDataRequired={isPaymentDataRequired()}
                isSignedIn={!isSignedIn}
                loadInstruments={checkoutService.loadInstruments}
                method={method}
                onUnhandledError={onUnhandledError}
                setFieldValue={setFieldValue}
                setSubmit={setSubmit}
                setValidationSchema={setValidationSchema}
                shouldHideInstrumentExpiryDate={shouldHideInstrumentExpiryDate}
                shouldRenderCustomInstrument
                signOut={checkoutService.signOutCustomer}
                validateInstrument={validateInstrument}
            />
            <Modal
                additionalBodyClassName="modal-body--center"
                closeButtonLabel={language.translate('common.close_action')}
                isOpen={showAdditionalActionContent}
                onRequestClose={cancelAdditionalActionModalFlow}
                shouldShowCloseButton={true}
            >
                <div id={additionalActionContainerId} style={{ width: '100%' }} />
            </Modal>
            {!showAdditionalActionContent && (
                <div id={additionalActionContainerId} style={{ display: 'none' }} />
            )}
        </>
    );
};

export default AdyenV2Form;
