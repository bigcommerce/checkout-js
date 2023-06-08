import { AchInstrument } from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { isAchInstrument } from '@bigcommerce/checkout/instrument-utils';
import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';

interface WithUseInstrumentProps {
    handleSelectInstrument: (id: string) => void;
    handleUseNewInstrument: () => void;
    currentInstrument?: AchInstrument;
    filterTrustedInstruments: AchInstrument[];
    shouldShowInstrumentFieldset: boolean;
}

const useInstrumentProps = (
    checkoutState: PaymentMethodProps['checkoutState'],
    method: PaymentMethodProps['method'],
    setFieldValue: PaymentFormService['setFieldValue'],
    isInstrumentFeatureAvailable?: boolean,
): WithUseInstrumentProps => {
    const [currentInstrument, setCurrentInstrument] = useState<AchInstrument | undefined>();

    const currentMethodInstruments = useMemo(
        () => checkoutState.data.getInstruments(method) || [],
        [checkoutState, method],
    );

    const filterAccountInstruments = useMemo(
        (): AchInstrument[] => currentMethodInstruments.filter(isAchInstrument),
        [currentMethodInstruments],
    );

    const filterTrustedInstruments = useMemo(
        (): AchInstrument[] =>
            filterAccountInstruments.filter(({ trustedShippingAddress }) => trustedShippingAddress),
        [filterAccountInstruments],
    );

    const isNewAddress =
        filterTrustedInstruments.length === 0 && filterAccountInstruments.length > 0;

    const shouldShowInstrumentFieldset =
        Boolean(isInstrumentFeatureAvailable) &&
        (filterTrustedInstruments.length > 0 || isNewAddress);

    const getDefaultInstrument = useCallback((): AchInstrument | undefined => {
        if (!filterTrustedInstruments.length) {
            return;
        }

        const selectedInstrument = filterTrustedInstruments.filter(
            ({ defaultInstrument }) => defaultInstrument,
        );

        return selectedInstrument[0] || filterTrustedInstruments[0];
    }, [filterTrustedInstruments]);

    const handleSelectInstrument = useCallback(
        (id: string) => {
            setCurrentInstrument(find(filterTrustedInstruments, { bigpayToken: id }));
            setFieldValue('instrumentId', id);
            setFieldValue('shouldSetAsDefaultInstrument', false);
        },
        [filterTrustedInstruments, setFieldValue],
    );

    const handleUseNewInstrument = useCallback(() => {
        setCurrentInstrument(undefined);

        setFieldValue('instrumentId', '');
        setFieldValue('shouldSaveInstrument', false);
        setFieldValue('shouldSetAsDefaultInstrument', false);
    }, [setFieldValue]);

    useEffect(() => {
        setCurrentInstrument(isInstrumentFeatureAvailable ? getDefaultInstrument() : undefined);
    }, [getDefaultInstrument, isInstrumentFeatureAvailable]);

    useEffect(() => {
        if (!shouldShowInstrumentFieldset) {
            setFieldValue('instrumentId', '');
        }
    }, [setFieldValue, shouldShowInstrumentFieldset]);

    return {
        currentInstrument,
        filterTrustedInstruments,
        shouldShowInstrumentFieldset,
        handleSelectInstrument,
        handleUseNewInstrument,
    };
};

export default useInstrumentProps;
