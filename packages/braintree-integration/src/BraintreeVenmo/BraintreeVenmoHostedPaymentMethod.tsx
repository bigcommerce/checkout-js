import { AccountInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find, noop } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import { LoadingOverlay } from '@bigcommerce/checkout/ui';
import {
    AccountInstrumentFieldset,
    isAccountInstrument,
    isInstrumentFeatureAvailable,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';

const BraintreeVenmoHostedPaymentMethod: FunctionComponent<any> = ({
    description,
    isInitializing = false,
    method,
    onUnhandledError = noop,
    checkoutService,
    checkoutState,
}) => {
    const [isAddingNewInstrument, setIsAddingNewInstrument] = useState(false);
    const [selectedInstrument, setSelectedInstrument] = useState<AccountInstrument | undefined>();

    const {
        data: { getCart, getConfig, getCustomer, getInstruments, isPaymentDataSubmitted },
        statuses: { isLoadingInstruments },
    } = checkoutState;

    const config = getConfig();
    const cart = getCart();
    const customer = getCustomer();

    if (!config || !cart || !customer || !method) {
        return null;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const filterAccountInstruments = useMemo(
        () =>
            memoizeOne((paymentInstruments: PaymentInstrument[] = []) =>
                paymentInstruments.filter(isAccountInstrument),
            ),
        [],
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const filterTrustedInstruments = useMemo(
        () =>
            memoizeOne((instrumentsArray: AccountInstrument[] = []) =>
                instrumentsArray.filter(({ trustedShippingAddress }) => trustedShippingAddress),
            ),
        [],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const currentMethodInstruments = filterAccountInstruments(getInstruments(method) || []);
    const instruments = filterTrustedInstruments(currentMethodInstruments);

    const isNewAddress = instruments.length === 0 && currentMethodInstruments.length > 0;

    const isInstrumentFeatureAvailableProp =
        config &&
        customer &&
        !isPaymentDataSubmitted(method.id, method.gateway) &&
        isInstrumentFeatureAvailable({
            config,
            customer,
            paymentMethod: method,
            isUsingMultiShipping: false, //TODO: CHECK
        });

    const loadInstruments = checkoutService.loadInstruments;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const getDefaultInstrument = useCallback((): AccountInstrument | undefined => {
        if (isAddingNewInstrument || !instruments.length) {
            return;
        }

        return find(instruments, { defaultInstrument: true }) || instruments[0];
    }, [isAddingNewInstrument, instruments]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setSelectedInstrument(getDefaultInstrument());
    }, [getDefaultInstrument]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });

                if (isInstrumentFeatureAvailableProp) {
                    await loadInstruments();
                }
            } catch (error) {
                onUnhandledError(error);
            }
        };

        void initializePayment();

        return () => {
            const deinitializePayment = async () => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    onUnhandledError(error);
                }
            };
            void deinitializePayment();
        };
    }, [loadInstruments, method, isInstrumentFeatureAvailableProp, onUnhandledError]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleUseNewInstrument = useCallback(() => {
        setIsAddingNewInstrument(true);
        setSelectedInstrument(undefined);
    }, []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const handleSelectInstrument = useCallback(
        (id: string) => {
            setIsAddingNewInstrument(false);
            setSelectedInstrument(find(instruments, { bigpayToken: id }));
        },
        [instruments],
    );

    const isLoading = isInitializing || isLoadingInstruments();
    const shouldShowInstrumentFieldset =
        isInstrumentFeatureAvailableProp && (instruments.length > 0 || isNewAddress);

    if (!description && !isInstrumentFeatureAvailableProp) {
        return null;
    }

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <div className="paymentMethod paymentMethod--hosted">
                {description}

                {shouldShowInstrumentFieldset && (
                    <AccountInstrumentFieldset
                        instruments={instruments}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewInstrument}
                        selectedInstrument={selectedInstrument}
                    />
                )}

                {isInstrumentFeatureAvailableProp && (
                    <StoreInstrumentFieldset
                        instrumentId={selectedInstrument && selectedInstrument.bigpayToken}
                        instruments={instruments}
                        isAccountInstrument={true}
                    />
                )}
            </div>
        </LoadingOverlay>
    );
};

export default BraintreeVenmoHostedPaymentMethod;
