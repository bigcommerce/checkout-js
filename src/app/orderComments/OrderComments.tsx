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
            maxLength={ 2000 }
            autoComplete={ 'off' }
        />
    ), []);

    const legend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.order_comment_label" />
        </Legend>
    ), []);

    return <Fieldset testId="checkout-shipping-comments" legend={ legend }>
        <FormField
            name="orderComment"
            label={ renderLabel }
            input={ renderInput }
        />
    </Fieldset>;
};

export default OrderComments;
