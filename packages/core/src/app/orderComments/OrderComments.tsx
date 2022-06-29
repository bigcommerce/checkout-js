import { FieldProps } from 'formik';
import React, { useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { Fieldset, FormField, Label, Legend, TextInput } from '../ui/form';

const OrderComments: FunctionComponent = () => {
    const renderLabel = useCallback(name => (
        <Label hidden htmlFor={ name }>
            <TranslatedString id="shipping.order_comment_label" />
        </Label>
    ), []);

    const renderInput = useCallback(({ field }: FieldProps) => (
        <TextInput
            { ...field }
            autoComplete={ 'off' }
            maxLength={ 2000 }
        />
    ), []);

    const legend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.order_comment_label" />
        </Legend>
    ), []);

    return <Fieldset legend={ legend } testId="checkout-shipping-comments">
        <FormField
            input={ renderInput }
            label={ renderLabel }
            name="orderComment"
        />
    </Fieldset>;
};

export default OrderComments;
