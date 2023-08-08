import React, { FunctionComponent } from 'react';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

const AdyenV3Form: FunctionComponent<any> = ({
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
    isPaymentDataRequired,
    checkoutService,
    checkoutState,
    ...rest
}) => {
    const { paymentForm } = usePaymentFormContext();
    const customer = checkoutState.data.getCustomer();
    const instruments = checkoutState.data.getInstruments(method) || [];
    const isInstrumentFeatureAvailable =
        !customer?.isGuest && Boolean(method.config.isVaultingEnabled);

    return (
        <>
            <HostedWidgetPaymentComponent
                {...rest}
                containerId={containerId}
                deinitializePayment={checkoutService.deinitializePayment}
                hideContentWhenSignedOut
                initializePayment={initializePayment}
                instruments={instruments}
                isAccountInstrument={isAccountInstrument}
                isInstrumentFeatureAvailable={isInstrumentFeatureAvailable}
                isPaymentDataRequired={isPaymentDataRequired()}
                method={method}
                setSubmit={paymentForm.setSubmit}
                setValidationSchema={paymentForm.setValidationSchema}
                shouldHideInstrumentExpiryDate={shouldHideInstrumentExpiryDate}
                shouldRenderCustomInstrument
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

export default AdyenV3Form;
