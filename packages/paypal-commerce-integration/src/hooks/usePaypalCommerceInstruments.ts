import { AccountInstrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isAccountInstrument } from '@bigcommerce/checkout/instrument-utils';
import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

const usePaypalCommerceInstrument = (method: PaymentMethod) => {
    const [currentInstrument, setCurrentInstrument] = useState<AccountInstrument | undefined>();

    const { checkoutState } = useCheckout();
    const customer = checkoutState.data.getCustomer();
    const instruments = checkoutState.data.getInstruments(method) || [];

    const { paymentForm } = usePaymentFormContext();
    const { setFieldValue } = paymentForm;

    const accountInstruments = useMemo(
        () => instruments.filter(isAccountInstrument),
        [instruments],
    );
    const isInstrumentFeatureAvailable =
        !customer?.isGuest && Boolean(method.config.isVaultingEnabled);
    const shouldShowInstrumentFieldset =
        isInstrumentFeatureAvailable && accountInstruments.length > 0;
    const shouldCreateNewInstrument = shouldShowInstrumentFieldset && !currentInstrument;
    const shouldConfirmInstrument =
        shouldShowInstrumentFieldset &&
        !!currentInstrument &&
        !currentInstrument.trustedShippingAddress;

    const getDefaultInstrument = (): AccountInstrument | undefined => {
        if (!accountInstruments.length) {
            return;
        }

        const defaultAccountInstrument = accountInstruments.filter(
            ({ defaultInstrument }) => defaultInstrument,
        );

        return defaultAccountInstrument[0] || accountInstruments[0];
    };

    useEffect(() => {
        setCurrentInstrument(isInstrumentFeatureAvailable ? getDefaultInstrument() : undefined);
    }, [isInstrumentFeatureAvailable, accountInstruments]);

    useEffect(() => {
        if (!shouldShowInstrumentFieldset) {
            setFieldValue('instrumentId', '');
        }
    }, [setFieldValue, shouldShowInstrumentFieldset]);

    const handleSelectInstrument = useCallback(
        (id: string) => {
            setCurrentInstrument(find(accountInstruments, { bigpayToken: id }));
            setFieldValue('instrumentId', id);
            setFieldValue('shouldSetAsDefaultInstrument', false);
        },
        [accountInstruments, setFieldValue],
    );

    const handleUseNewInstrument = useCallback(() => {
        setCurrentInstrument(undefined);
        setFieldValue('instrumentId', '');
        setFieldValue('shouldSaveInstrument', false);
        setFieldValue('shouldSetAsDefaultInstrument', false);
    }, [setFieldValue]);

    return {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
        shouldConfirmInstrument,
    };
};

export default usePaypalCommerceInstrument;
