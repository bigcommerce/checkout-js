import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find, get, noop } from 'lodash';
import React, { type FunctionComponent, memo, useCallback, useMemo } from 'react';

import { useCheckout, useLocale } from '@bigcommerce/checkout/contexts';
import { Checklist, ChecklistItem } from '@bigcommerce/checkout/ui';

import { connectFormik, type ConnectFormikProps } from '../../common/form';
import { isMobile } from '../../common/utility';

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
    const {
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();

    const config = getConfig();

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

    return (
        <>
            <div aria-live="assertive" className="is-srOnly" role="status">
                {titleText}
            </div>
            <Checklist
                defaultSelectedItemId={values.paymentProviderRadio}
                isDisabled={isInitializingPayment}
                name="paymentProviderRadio"
                onSelect={handleSelect}
            >
                {methods.map((method) => {
                    const value = getUniquePaymentMethodId(method.id, method.gateway);
                    const showOnlyOnMobileDevices = get(
                        method,
                        'initializationData.showOnlyOnMobileDevices',
                        false,
                    );

                    if (showOnlyOnMobileDevices && !isMobile()) {
                        return;
                    }

                    return (
                        <PaymentMethodListItem
                            disabledReason={
                                method === chequeMethod ? chequeDisabledReason : undefined
                            }
                            isDisabled={isInitializingPayment}
                            isEmbedded={isEmbedded}
                            isUsingMultiShipping={isUsingMultiShipping}
                            key={value}
                            method={method}
                            onUnhandledError={onUnhandledError}
                            value={value}
                        />
                    );
                })}
            </Checklist>
        </>
    );
};

interface PaymentMethodListItemProps {
    disabledReason?: PoDisabledReason;
    isDisabled?: boolean;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
    value: string;
    onUnhandledError?(error: Error): void;
}

const PaymentMethodListItem: FunctionComponent<PaymentMethodListItemProps> = ({
    disabledReason,
    isDisabled,
    isEmbedded,
    isUsingMultiShipping,
    method,
    onUnhandledError,
    value,
}) => {
    const renderPaymentMethod = useMemo(() => {
        return (
            <PaymentMethodV2
                isEmbedded={isEmbedded}
                isUsingMultiShipping={isUsingMultiShipping}
                method={method}
                onUnhandledError={onUnhandledError || noop}
            />
        );
    }, [isEmbedded, isUsingMultiShipping, method, onUnhandledError]);

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
            isDisabled={isDisabled || Boolean(disabledReason)}
            label={renderPaymentMethodTitle}
            value={value}
        />
    );
};

export default connectFormik(memo(PaymentMethodList));
