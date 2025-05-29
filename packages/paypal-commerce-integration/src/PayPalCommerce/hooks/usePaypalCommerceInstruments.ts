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

    const trustedAccountInstruments = useMemo(
        () => accountInstruments.filter((instrument) => instrument.trustedShippingAddress),
        [accountInstruments],
    );

    const hasAccountInstruments = accountInstruments.length > 0;

    const isInstrumentFeatureAvailable =
        !customer?.isGuest &&
        Boolean(method.config.isVaultingEnabled) &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        !method.initializationData.isComplete;
    const shouldShowInstrumentFieldset = isInstrumentFeatureAvailable && hasAccountInstruments;

    const shouldCreateNewInstrument = shouldShowInstrumentFieldset && !currentInstrument;
    const shouldConfirmInstrument =
        shouldShowInstrumentFieldset && !!currentInstrument && !trustedAccountInstruments.length;

    const getDefaultInstrument = (): AccountInstrument | undefined => {
        if (!trustedAccountInstruments.length) {
            return;
        }

        const defaultAccountInstrument = trustedAccountInstruments.filter(
            ({ defaultInstrument }) => defaultInstrument,
        );

        return defaultAccountInstrument[0] || trustedAccountInstruments[0];
    };

    useEffect(() => {
        setCurrentInstrument(isInstrumentFeatureAvailable ? getDefaultInstrument() : undefined);
    }, [isInstrumentFeatureAvailable, trustedAccountInstruments]);

    useEffect(() => {
        if (!shouldShowInstrumentFieldset) {
            setFieldValue('instrumentId', '');
        }
    }, [setFieldValue, shouldShowInstrumentFieldset]);

    const handleSelectInstrument = useCallback(
        (id: string) => {
            setCurrentInstrument(find(trustedAccountInstruments, { bigpayToken: id }));
            setFieldValue('instrumentId', id);
            setFieldValue('shouldSetAsDefaultInstrument', false);
        },
        [trustedAccountInstruments, setFieldValue],
    );

    const handleUseNewInstrument = useCallback(() => {
        setCurrentInstrument(undefined);
        setFieldValue('instrumentId', '');
        setFieldValue('shouldSaveInstrument', false);
        setFieldValue('shouldSetAsDefaultInstrument', false);
    }, [setFieldValue]);

    return {
        trustedAccountInstruments,
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
