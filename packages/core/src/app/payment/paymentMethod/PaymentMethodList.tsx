import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find, noop } from 'lodash';
import React, { type FunctionComponent, memo, useCallback, useMemo } from 'react';

import { useCheckout, useLocale, useThemeContext } from '@bigcommerce/checkout/contexts';
import {
    Checklist,
    ChecklistItem,
    LoadingOverlay,
    LoadingSkeletonContext,
    PaymentMethodSkeleton,
} from '@bigcommerce/checkout/ui';

import { connectFormik, type ConnectFormikProps } from '../../common/form';

import CustomChecklistItem from './CustomChecklistItem';
import getPaymentMethodName from './getPaymentMethodName';
import getUniquePaymentMethodId, { parseUniquePaymentMethodId } from './getUniquePaymentMethodId';
import PaymentMethodTitle, { getPaymentMethodTitle } from './PaymentMethodTitle';
import PaymentMethodV2 from './PaymentMethodV2';
import { type PoDisabledReason, usePoMethodDisabledReason } from './usePoMethodDisabledReason';

export interface PaymentMethodListProps {
    isEmbedded?: boolean;
    isInitializingPayment?: boolean;
    isUsingMultiShipping?: boolean;
    methods: PaymentMethod[];
    onSelect?(method: PaymentMethod): void;
    onUnhandledError?(error: Error): void;
}

const paymentMethodSkeleton = <PaymentMethodSkeleton />;

function getPaymentMethodFromListValue(methods: PaymentMethod[], value: string): PaymentMethod {
    const { gatewayId: gateway, methodId: id } = parseUniquePaymentMethodId(value);
    const method = gateway ? find(methods, { gateway, id }) : find(methods, { id });

    if (!method) {
        throw new Error(`Unable to find payment method with id: ${id}`);
    }

    return method;
}

const PaymentMethodList: FunctionComponent<
    PaymentMethodListProps & ConnectFormikProps<{ paymentProviderRadio?: string }>
> = ({
    formik: { values },
    isEmbedded,
    isInitializingPayment,
    isUsingMultiShipping,
    methods,
    onSelect = noop,
    onUnhandledError,
}) => {
    const { language } = useLocale();
    const { selectedState: config } = useCheckout(({ data }) => data.getConfig());
    const { enhancedThemeV1 } = useThemeContext();

    const chequeMethod = find(methods, { id: 'cheque' });
    const chequeDisabledReason = usePoMethodDisabledReason(chequeMethod);

    const titleText = useMemo(() => {
        if (config && values.paymentProviderRadio) {
            const checkoutSettings = config.checkoutSettings;
            const cdnBasePath = config.cdnPath;
            const storeCountryCode = config.storeProfile.storeCountryCode;
            const paymentMethod = getPaymentMethodFromListValue(
                methods,
                values.paymentProviderRadio,
            );
            const methodName = getPaymentMethodName(language)(paymentMethod);
            const { titleText } = getPaymentMethodTitle(
                language,
                cdnBasePath,
                checkoutSettings,
                storeCountryCode,
            )(paymentMethod);

            return titleText || methodName;
        }

        return '';
    }, [config, values.paymentProviderRadio]);

    const handleSelect = useCallback(
        (value: string) => {
            onSelect(getPaymentMethodFromListValue(methods, value));
        },
        [methods, onSelect],
    );

    const checklist = (
        <Checklist
            defaultSelectedItemId={values.paymentProviderRadio}
            name="paymentProviderRadio"
            onSelect={handleSelect}
        >
            {methods.map((method) => {
                const value = getUniquePaymentMethodId(method.id, method.gateway);

                return (
                    <PaymentMethodListItem
                        disabledReason={method === chequeMethod ? chequeDisabledReason : undefined}
                        isEmbedded={isEmbedded}
                        isInitializingPayment={isInitializingPayment}
                        isUsingMultiShipping={isUsingMultiShipping}
                        key={value}
                        method={method}
                        onUnhandledError={onUnhandledError}
                        value={value}
                    />
                );
            })}
        </Checklist>
    );

    return (
        <>
            <div aria-live="assertive" className="is-srOnly" role="status">
                {titleText}
            </div>
            {enhancedThemeV1 ? (
                // enhancedThemeV1 keeps the method list visible while a method
                // initializes: no spinner veil, and the initializing method's
                // fields render as a skeleton (items stay read-only via
                // isReadOnly until initialization finishes).
                <LoadingSkeletonContext.Provider value={paymentMethodSkeleton}>
                    {checklist}
                </LoadingSkeletonContext.Provider>
            ) : (
                <LoadingOverlay isLoading={Boolean(isInitializingPayment)}>
                    {checklist}
                </LoadingOverlay>
            )}
        </>
    );
};

interface PaymentMethodListItemProps {
    disabledReason?: PoDisabledReason;
    isEmbedded?: boolean;
    isInitializingPayment?: boolean;
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
    value: string;
    onUnhandledError?(error: Error): void;
}

const PaymentMethodListItem: FunctionComponent<PaymentMethodListItemProps> = ({
    disabledReason,
    isEmbedded,
    isInitializingPayment,
    isUsingMultiShipping,
    method,
    onUnhandledError,
    value,
}) => {
    const { enhancedThemeV1 } = useThemeContext();

    const renderPaymentMethod = useMemo(() => {
        const paymentMethod = (
            <PaymentMethodV2
                isEmbedded={isEmbedded}
                isUsingMultiShipping={isUsingMultiShipping}
                method={method}
                onUnhandledError={onUnhandledError || noop}
            />
        );

        // enhancedThemeV1 has no spinner veil over the list, so stand in a
        // skeleton (from LoadingSkeletonContext) for the selected method's
        // fields while it initializes. Doing it here works for every
        // integration, whether or not it forwards isInitializing to its own
        // LoadingOverlay.
        return enhancedThemeV1 ? (
            <LoadingOverlay hideContentWhenLoading isLoading={Boolean(isInitializingPayment)}>
                {paymentMethod}
            </LoadingOverlay>
        ) : (
            paymentMethod
        );
    }, [
        enhancedThemeV1,
        isEmbedded,
        isInitializingPayment,
        isUsingMultiShipping,
        method,
        onUnhandledError,
    ]);

    const renderPaymentMethodTitle = useCallback(
        (isSelected: boolean) => (
            <PaymentMethodTitle
                disabledReason={disabledReason}
                isSelected={isSelected}
                method={method}
                onUnhandledError={onUnhandledError}
            />
        ),
        [disabledReason, method],
    );

    if (method.initializationData?.isCustomChecklistItem) {
        return <CustomChecklistItem content={renderPaymentMethod} htmlId={`radio-${value}`} />;
    }

    return (
        <ChecklistItem
            content={renderPaymentMethod}
            htmlId={`radio-${value}`}
            isDisabled={Boolean(disabledReason)}
            isReadOnly={isInitializingPayment}
            label={renderPaymentMethodTitle}
            value={value}
        />
    );
};

export default connectFormik(memo(PaymentMethodList));
