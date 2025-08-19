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

import PayPalCommercePaymentMethodComponent from '../components/PayPalCommercePaymentMethodComponent';

import usePaypalCommerceInstrument from './hooks/usePaypalCommerceInstruments';

const PayPalCommercePaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const {
        checkoutState: {
            data: { isPaymentDataRequired, getCustomer, getInstruments },
            statuses: { isLoadingInstruments, isLoadingPaymentMethod },
        },
        method: {
            config: { isVaultingEnabled },
            initializationData: { isComplete },
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
    } = usePaypalCommerceInstrument(method);

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
    }, []);

    if (!isPaymentDataRequired()) {
        return null;
    }

    const isLoading = isLoadingInstruments() || isLoadingPaymentMethod(method.id);
    const allInstruments = getInstruments() || [];

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <PayPalCommercePaymentMethodComponent
                currentInstrument={currentInstrument}
                providerOptionsKey="paypalcommerce"
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
            </PayPalCommercePaymentMethodComponent>
        </LoadingOverlay>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommercePaymentMethod,
    [{ id: 'paypalcommerce' }],
);
