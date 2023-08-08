import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

const AdyenV2Form: FunctionComponent<any> = ({
    method,
    containerId,
    initializePayment,
    shouldHideInstrumentExpiryDate,
    validateInstrument,
    language,
    showAdditionalActionContent,
    cancelAdditionalActionModalFlow,
    additionalActionContainerId,
    ...rest
}) => {
    const {
        paymentForm: { setSubmit, setValidationSchema },
    } = usePaymentFormContext();
    const { checkoutState } = useCheckout();
    const customer = checkoutState.data.getCustomer();
    const instruments = checkoutState.data.getInstruments(method) || [];

    const isInstrumentFeatureAvailable =
        !customer?.isGuest && Boolean(method.config.isVaultingEnabled);
    const checkoutService = createCheckoutService();
    const {
        checkoutState: {
            data: { isPaymentDataRequired },
        },
    } = useCheckout();

    const isAccountInstrument = () => {
        switch (method.method) {
            case 'directEbanking':
            case 'giropay':
            case 'ideal':
            case 'sepadirectdebit':
                return true;

            default:
                return false;
        }
    };

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
                setSubmit={setSubmit}
                setValidationSchema={setValidationSchema}
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

export default AdyenV2Form;
