import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find, get, noop } from 'lodash';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { isMobile } from '../../common/utility';
import { Checklist, ChecklistItem } from '../../ui/form';

import getUniquePaymentMethodId, { parseUniquePaymentMethodId } from './getUniquePaymentMethodId';
import PaymentMethodTitle from './PaymentMethodTitle';
import PaymentMethodV2 from './PaymentMethodV2';

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
    const handleSelect = useCallback(
        (value: string) => {
            onSelect(getPaymentMethodFromListValue(methods, value));
        },
        [methods, onSelect],
    );

    return (
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
    );
};

interface PaymentMethodListItemProps {
    isDisabled?: boolean;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
    value: string;
    onUnhandledError?(error: Error): void;
}

const PaymentMethodListItem: FunctionComponent<PaymentMethodListItemProps> = ({
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
        (isSelected: boolean) => <PaymentMethodTitle isSelected={isSelected} method={method} onUnhandledError={onUnhandledError} />,
        [method],
    );

    return (
        <ChecklistItem
            content={renderPaymentMethod}
            htmlId={`radio-${value}`}
            isDisabled={isDisabled}
            label={renderPaymentMethodTitle}
            value={value}
        />
    );
};

export default connectFormik(memo(PaymentMethodList));
