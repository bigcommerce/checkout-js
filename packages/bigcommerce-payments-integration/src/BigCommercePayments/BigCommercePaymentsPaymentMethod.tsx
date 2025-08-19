import React, { type FunctionComponent, useEffect } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedHtml } from '@bigcommerce/checkout/locale';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import BigCommercePaymentsPaymentMethodComponent from '../components/BigCommercePaymentsPaymentMethodComponent';
import useBigCommercePaymentsInstrument from '../hooks/useBigCommercePaymentsInstruments';

const BigCommercePaymentsPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const {
        checkoutState: {
            data: { isPaymentDataRequired, getCustomer, getInstruments },
            statuses: { isLoadingInstruments, isLoadingPaymentMethod },
        },
        method: {
            config: { isVaultingEnabled },
            initializationData: { ...isComplete },
        },
        method,
        checkoutService,
        onUnhandledError,
    } = props;

    const {
        trustedAccountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldConfirmInstrument,
    } = useBigCommercePaymentsInstrument(method);

    useEffect(() => {
        const loadInstrumentsOrThrow = async () => {
            try {
                await checkoutService.loadInstruments();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        const { isGuest } = getCustomer() || {};

        const shouldLoadInstruments = !isGuest && isVaultingEnabled && !isComplete;

        if (shouldLoadInstruments) {
            void loadInstrumentsOrThrow();
        }
    });

    if (!isPaymentDataRequired()) {
        return null;
    }

    const isLoading = isLoadingInstruments() || isLoadingPaymentMethod(method.id);
    const allInstruments = getInstruments() || [];

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <BigCommercePaymentsPaymentMethodComponent
                currentInstrument={currentInstrument}
                providerOptionsKey="bigcommerce_payments"
                shouldConfirmInstrument={shouldConfirmInstrument}
                {...props}
            >
                {shouldShowInstrumentFieldset && (
                    <AccountInstrumentFieldset
                        instruments={trustedAccountInstruments}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewInstrument}
                        selectedInstrument={currentInstrument}
                    />
                )}

                {shouldConfirmInstrument && (
                    <div>
                        <TranslatedHtml id="payment.account_instrument_new_shipping_address" />
                    </div>
                )}

                {isInstrumentFeatureAvailable && (
                    <StoreInstrumentFieldset
                        instrumentId={currentInstrument?.bigpayToken}
                        instruments={allInstruments}
                        isAccountInstrument
                    />
                )}
            </BigCommercePaymentsPaymentMethodComponent>
        </LoadingOverlay>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BigCommercePaymentsPaymentMethod,
    [{ id: 'bigcommerce_payments' }],
);
