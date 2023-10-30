import { CardInstrument, CheckoutSelectors, PaymentMethod } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, useState } from 'react';

import {
    CardInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface SquareV2FormProps {
    checkoutState: CheckoutSelectors;
    containerId: string;
    deinitializePayment: () => Promise<void>;
    initializePayment: () => Promise<void>;
    method: PaymentMethod;
}

const SquareV2Form: FunctionComponent<SquareV2FormProps> = ({
    checkoutState,
    containerId,
    deinitializePayment,
    initializePayment,
    method,
}) => {
    const { getCustomer, getInstruments } = checkoutState.data;
    const instruments = getInstruments(method) || [];
    const isSignedIn = getCustomer()?.isGuest;
    const { isLoadingInstruments } = checkoutState.statuses;
    const { setFieldValue } = usePaymentFormContext().paymentForm;

    const isInstrumentFeatureAvailable = !isSignedIn && Boolean(method.config.isVaultingEnabled);
    const shouldShowInstrumentFieldset = isInstrumentFeatureAvailable && instruments.length > 0;

    const [isAddingNewCard, setIsAddingNewCard] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>(undefined);

    const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;

    const getDefaultInstrumentId: () => string | undefined = () => {
        if (isAddingNewCard) {
            return;
        }

        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument.bigpayToken;
    };

    const handleDeleteInstrument: (id: string) => void = (id) => {
        if (instruments.length === 0) {
            setIsAddingNewCard(true);
            setSelectedInstrumentId(undefined);

            setFieldValue('instrumentId', '');
        } else if (selectedInstrumentId === id) {
            setSelectedInstrumentId(getDefaultInstrumentId());

            setFieldValue('instrumentId', getDefaultInstrumentId());
        }
    };

    const handleSelectInstrument: (id: string) => void = (id) => {
        setIsAddingNewCard(false);
        setSelectedInstrumentId(id);
    };

    const handleUseNewCard: () => void = () => {
        setIsAddingNewCard(true);
        setSelectedInstrumentId(undefined);

        void deinitializePayment();

        void initializePayment();
    };

    const renderPlaceholderFields = () => {
        return (
            <div data-test="squarev2_placeholder_form" style={{ display: 'none' }}>
                <div className="form-field">
                    <div
                        className="form-label optimizedCheckout-form-label"
                        id="messageIsDefault"
                    />
                    <div className="form-input optimizedCheckout-form-input" id="inputIsDefault" />
                </div>
                <div className="form-field">
                    <div
                        className="form-input optimizedCheckout-form-input form-input--focus optimizedCheckout-form-input--focus"
                        id="inputIsFocus"
                    />
                </div>
                <div className="form-field form-field--error">
                    <div className="form-inlineMessage" id="messageIsError" />
                    <div className="form-input optimizedCheckout-form-input" id="inputIsError" />
                </div>
            </div>
        );
    };

    return (
        <LoadingOverlay
            data-test="squarev2_loading_overlay"
            hideContentWhenLoading
            isLoading={isLoadingInstruments()}
        >
            <div className="paymentMethod--hosted">
                {shouldShowInstrumentFieldset && (
                    <CardInstrumentFieldset
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        instruments={instruments as CardInstrument[]}
                        onDeleteInstrument={handleDeleteInstrument}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewCard}
                        selectedInstrumentId={selectedInstrumentId}
                    />
                )}
                <div
                    className={classNames('widget', `widget--${method.id}`, 'payment-widget')}
                    data-test={containerId}
                    style={{
                        display: !shouldShowCreditCardFieldset ? 'none' : undefined,
                    }}
                    tabIndex={-1}
                >
                    {renderPlaceholderFields()}
                    <div id={containerId} />
                </div>

                {isInstrumentFeatureAvailable && (
                    <StoreInstrumentFieldset instrumentId={selectedInstrumentId} />
                )}
            </div>
        </LoadingOverlay>
    );
};

export default SquareV2Form;
