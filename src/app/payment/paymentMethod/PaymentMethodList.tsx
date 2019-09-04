import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { find, noop } from 'lodash';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { Checklist, ChecklistItem } from '../../ui/form';

import getUniquePaymentMethodId, { parseUniquePaymentMethodId } from './getUniquePaymentMethodId';
import { default as PaymentMethodComponent } from './PaymentMethod';
import PaymentMethodTitle from './PaymentMethodTitle';

export interface PaymentMethodListProps {
    isEmbedded?: boolean;
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
    PaymentMethodListProps &
    ConnectFormikProps<{ paymentProviderRadio?: string }>
> = ({
    formik: { values },
    isEmbedded,
    isUsingMultiShipping,
    methods,
    onSelect = noop,
    onUnhandledError,
}) => {
    const handleSelect = useCallback((value: string) => {
        onSelect(getPaymentMethodFromListValue(methods, value));
    }, [
        methods,
        onSelect,
    ]);

    const renderPaymentMethod = useCallback(memoize((method: PaymentMethod) => {
        return (
            <PaymentMethodComponent
                isEmbedded={ isEmbedded }
                isUsingMultiShipping={ isUsingMultiShipping }
                method={ method }
                onUnhandledError={ onUnhandledError }
            />
        );
    }, { maxSize: methods.length }), [
        isEmbedded,
        isUsingMultiShipping,
        methods.length,
        onUnhandledError,
    ]);

    const renderPaymentMethodTitle = useCallback(memoize((method: PaymentMethod) => (isSelected: boolean) => {
        return (
            <PaymentMethodTitle
                method={ method }
                isSelected={ isSelected }
            />
        );
    }, { maxSize: methods.length }), [
        methods.length,
    ]);

    return <Checklist
        defaultSelectedItemId={ values.paymentProviderRadio }
        name="paymentProviderRadio"
        onSelect={ handleSelect }
    >
        { methods.map(method => {
            const value = getUniquePaymentMethodId(method.id, method.gateway);

            return (
                <ChecklistItem
                    content={ renderPaymentMethod(method) }
                    htmlId={ `radio-${value}` }
                    key={ value }
                    label={ renderPaymentMethodTitle(method) }
                    value={ value }
                />
            );
        }) }
    </Checklist>;
};

export default connectFormik(memo(PaymentMethodList));
