import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find, noop } from 'lodash';
import React, { FunctionComponent } from 'react';

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

const PaymentMethodList: FunctionComponent<PaymentMethodListProps & ConnectFormikProps<{ paymentProviderRadio?: string }>> = ({
    formik: { values },
    isEmbedded,
    isUsingMultiShipping,
    methods,
    onSelect = noop,
    onUnhandledError,
}) => (
    <Checklist
        defaultSelectedItemId={ values.paymentProviderRadio }
        name="paymentProviderRadio"
        onSelect={ value => onSelect(getPaymentMethodFromListValue(methods, value)) }
    >
        { methods.map(method => {
            const value = getUniquePaymentMethodId(method.id, method.gateway);

            return (
                <ChecklistItem
                    content={
                        <PaymentMethodComponent
                            isEmbedded={ isEmbedded }
                            isUsingMultiShipping={ isUsingMultiShipping }
                            method={ method }
                            onUnhandledError={ onUnhandledError }
                        />
                    }
                    htmlId={ `radio-${value}` }
                    key={ value }
                    label={ isSelected =>
                        <PaymentMethodTitle
                            method={ method }
                            isSelected={ isSelected }
                        />
                    }
                    value={ value }
                />
            );
        }) }
    </Checklist>
);

export default connectFormik(PaymentMethodList);
