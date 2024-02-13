import React, { FunctionComponent, useEffect } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
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
        accountInstruments,
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
                        instruments={accountInstruments}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewInstrument}
                        selectedInstrument={currentInstrument}
                    />
                )}

                {shouldConfirmInstrument && (
                    <div>
                        <TranslatedString id="payment.bank_account_instrument_trusted_shipping_address_text" />
                    </div>
                )}

                {isInstrumentFeatureAvailable && (
                    <StoreInstrumentFieldset
                        instrumentId={currentInstrument?.bigpayToken}
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
