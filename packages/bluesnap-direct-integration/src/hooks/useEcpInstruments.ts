import { AchInstrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isAchInstrument } from '@bigcommerce/checkout/instrument-utils';
import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

const useEcpInstruments = (method: PaymentMethod) => {
    const [currentInstrument, setCurrentInstrument] = useState<AchInstrument | undefined>();

    const { checkoutState } = useCheckout();
    const customer = checkoutState.data.getCustomer();
    const instruments = checkoutState.data.getInstruments(method);

    const { paymentForm } = usePaymentFormContext();
    const { setFieldValue } = paymentForm;

    const accountInstruments = useMemo(() => {
        if (instruments) {
            return instruments.filter(isAchInstrument);
        }

        return [];
    }, [instruments]);
    const isInstrumentFeatureAvailable =
        !customer?.isGuest && Boolean(method.config.isVaultingEnabled);
    const shouldShowInstrumentFieldset =
        isInstrumentFeatureAvailable && accountInstruments.length > 0;
    const shouldCreateNewInstrument = shouldShowInstrumentFieldset && !currentInstrument;

    const getDefaultInstrument = useCallback((): AchInstrument | undefined => {
        if (!accountInstruments.length) {
            return;
        }

        const defaultAccountInstrument = accountInstruments.filter(
            ({ defaultInstrument }) => defaultInstrument,
        );

        return defaultAccountInstrument[0] || accountInstruments[0];
    }, [accountInstruments]);

    useEffect(() => {
        setCurrentInstrument(isInstrumentFeatureAvailable ? getDefaultInstrument() : undefined);
    }, [isInstrumentFeatureAvailable, getDefaultInstrument]);

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
    };
};

export default useEcpInstruments;
