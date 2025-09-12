import {
    type AccountInstrument,
    type CheckoutSelectors,
    type CheckoutService,
    type LanguageService,
    type PaymentInitializeOptions,
    type PaymentInstrument,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find, noop } from 'lodash';
import React, { type ReactNode, useCallback, useEffect, useState } from 'react';

import {
    AccountInstrumentFieldset,
    isAccountInstrument,
    isInstrumentFeatureAvailable,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface HostedPaymentComponentProps {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    description?: ReactNode;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    language: LanguageService;
    method: PaymentMethod;
    paymentForm: PaymentFormService;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

interface HostedPaymentComponentDerivedProps {
    instruments: AccountInstrument[];
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isNewAddress: boolean;
    isPaymentDataRequired: boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
}

function getHostedPaymentMethodDerivedProps(
    props: HostedPaymentComponentProps,
): HostedPaymentComponentDerivedProps {
    const filterAccountInstruments = memoizeOne((instruments: PaymentInstrument[] = []) =>
        instruments.filter(isAccountInstrument),
    );
    const filterTrustedInstruments = memoizeOne((instruments: AccountInstrument[] = []) =>
        instruments.filter(({ trustedShippingAddress }) => trustedShippingAddress),
    );
    const { checkoutService, checkoutState, isUsingMultiShipping = false, method } = props;

    const {
        data: {
            getCart,
            getConfig,
            getCustomer,
            getInstruments,
            isPaymentDataRequired,
            isPaymentDataSubmitted,
        },
        statuses: { isLoadingInstruments },
    } = checkoutState;

    const cart = getCart();
    const config = getConfig();
    const customer = getCustomer();

    if (!config || !cart || !customer) {
        throw new Error('Unable to get checkout');
    }

    const currentMethodInstruments = filterAccountInstruments(getInstruments(method));
    const trustedInstruments = filterTrustedInstruments(currentMethodInstruments);

    return {
        instruments: trustedInstruments,
        isNewAddress: trustedInstruments.length === 0 && currentMethodInstruments.length > 0,
        isInstrumentFeatureAvailable:
            !isPaymentDataSubmitted(method.id, method.gateway) &&
            isInstrumentFeatureAvailable({
                config,
                customer,
                isUsingMultiShipping,
                paymentMethod: method,
            }),
        isLoadingInstruments: isLoadingInstruments(),
        isPaymentDataRequired: isPaymentDataRequired(),
        loadInstruments: checkoutService.loadInstruments,
    };
}

const HostedPaymentMethodComponent: React.FC<HostedPaymentComponentProps> = (props) => {
    const {
        description,
        isInitializing = false,
        initializePayment,
        method,
        onUnhandledError = noop,
        deinitializePayment,
    } = props;

    const [isAddingNewInstrument, setIsAddingNewInstrument] = useState(false);
    const [selectedInstrument, setSelectedInstrument] = useState<AccountInstrument | undefined>();

    const derivedProps = getHostedPaymentMethodDerivedProps(props);
    const {
        isLoadingInstruments,
        instruments,
        isNewAddress,
        isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
        loadInstruments,
    } = derivedProps;

    const getDefaultInstrument = useCallback((): AccountInstrument | undefined => {
        if (isAddingNewInstrument || !instruments.length) {
            return;
        }

        return find(instruments, { defaultInstrument: true }) || instruments[0];
    }, [isAddingNewInstrument, instruments]);

    const handleUseNewInstrument = useCallback(() => {
        setIsAddingNewInstrument(true);
        setSelectedInstrument(undefined);
    }, []);

    const handleSelectInstrument = useCallback(
        (id: string) => {
            setIsAddingNewInstrument(false);
            setSelectedInstrument(find(instruments, { bigpayToken: id }));
        },
        [instruments],
    );

    useEffect(() => {
        const initializePaymentAsync = async () => {
            try {
                await initializePayment({
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

        void initializePaymentAsync();

        return () => {
            const deinitializePaymentAsync = async () => {
                try {
                    await deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    onUnhandledError(error);
                }
            };

            void deinitializePaymentAsync();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentSelectedInstrument = selectedInstrument || getDefaultInstrument();
    const isLoading = isInitializing || isLoadingInstruments;
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
                        selectedInstrument={currentSelectedInstrument}
                    />
                )}

                {isInstrumentFeatureAvailableProp && (
                    <StoreInstrumentFieldset
                        instrumentId={
                            currentSelectedInstrument && currentSelectedInstrument.bigpayToken
                        }
                        instruments={instruments}
                        isAccountInstrument={true}
                    />
                )}
            </div>
        </LoadingOverlay>
    );
};

export default HostedPaymentMethodComponent;
