import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, type ReactNode } from 'react';
import { type Omit } from 'utility-types';

import {
    type HostedWidgetComponentProps,
    HostedWidgetPaymentComponent,
} from '@bigcommerce/checkout/hosted-widget-integration';
import {
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    usePaymentFormContext,
} from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

export enum UntrustedShippingCardVerificationType {
    CVV = 'cvv',
    PAN = 'pan',
}

export type AdyenV3FormProps = Omit<
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
    ) => ReactNode;
    shouldRenderAdditionalActionContentModal: boolean;
    isModalVisible: boolean;
    cancelAdditionalActionModalFlow: () => void;
    additionalActionContainerId: string;
};

const AdyenV3Form: FunctionComponent<AdyenV3FormProps & PaymentMethodProps> = ({
    method,
    containerId,
    initializePayment,
    isAccountInstrument,
    shouldHideInstrumentExpiryDate,
    validateInstrument,
    language,
    shouldRenderAdditionalActionContentModal,
    isModalVisible,
    cancelAdditionalActionModalFlow,
    additionalActionContainerId,
    checkoutState,
    checkoutService,
    onUnhandledError,
    ...rest
}) => {
    const { paymentForm } = usePaymentFormContext();
    const customer = checkoutState.data.getCustomer();
    const { isLoadingInstruments } = checkoutState.statuses;
    const { isPaymentDataRequired } = checkoutState.data;
    const instruments = checkoutState.data.getInstruments(method) || [];
    const isSignedIn = customer?.isGuest;
    const isInstrumentFeatureAvailable = !isSignedIn && Boolean(method.config.isVaultingEnabled);
    const isInstrumentCardCodeRequired = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequired = isInstrumentCardNumberRequiredSelector(checkoutState);

    const {
        hidePaymentSubmitButton,
        disableSubmit,
        setFieldValue,
        setSubmit,
        setValidationSchema,
    } = paymentForm;

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
                isOpen={shouldRenderAdditionalActionContentModal}
                onRequestClose={cancelAdditionalActionModalFlow}
                shouldShowCloseButton={true}
                style={
                    !isModalVisible && method.id === 'scheme'
                        ? {
                              overlay: {
                                  display: 'none',
                              },
                          }
                        : {}
                }
            >
                <div id={additionalActionContainerId} style={{ width: '100%' }} />
            </Modal>
            {!shouldRenderAdditionalActionContentModal && <div id={additionalActionContainerId} />}
        </>
    );
};

export default AdyenV3Form;
