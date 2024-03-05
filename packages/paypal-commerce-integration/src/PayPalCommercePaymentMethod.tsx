import React, { FunctionComponent, useEffect } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedHtml } from '@bigcommerce/checkout/locale';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import PayPalCommercePaymentMethodComponent from './components/PayPalCommercePaymentMethodComponent';
import usePaypalCommerceInstrument from './hooks/usePaypalCommerceInstruments';

const PayPalCommercePaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const {
        checkoutState: {
            data: { isPaymentDataRequired, getCustomer },
            statuses: { isLoadingInstruments, isLoadingPaymentMethod },
        },
        method: {
            config: { isVaultingEnabled },
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

        const shouldLoadInstruments = !isGuest && isVaultingEnabled;

        if (shouldLoadInstruments) {
            void loadInstrumentsOrThrow();
        }
    }, []);

    if (!isPaymentDataRequired()) {
        return null;
    }

    const isLoading = isLoadingInstruments() || isLoadingPaymentMethod(method.id);

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
                        instruments={trustedAccountInstruments}
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
