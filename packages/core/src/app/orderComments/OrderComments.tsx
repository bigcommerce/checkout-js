import { FieldProps } from 'formik';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { Fieldset, FormField, Label, Legend, TextInput } from '../ui/form';

const OrderComments: FunctionComponent = () => {
    const { newFontStyle } = useStyleContext();

    const renderLabel = useCallback(
        (name: string) => (
            <Label hidden htmlFor={name}>
                <TranslatedString id="shipping.order_comment_label" />
            </Label>
        ),
        [],
    );

    const renderInput = useCallback(
        ({ field }: FieldProps) => <TextInput {...field} autoComplete="off" id="orderComment" maxLength={2000} newFontStyle={newFontStyle} />,
        [],
    );

    const legend = useMemo(
        () => (
            <Legend newFontStyle={newFontStyle}>
                <TranslatedString id="shipping.order_comment_label" />
            </Legend>
        ),
        [],
    );

    return (
        <Fieldset legend={legend} testId="checkout-shipping-comments">
            <FormField id="orderComment" input={renderInput} label={renderLabel} name="orderComment" />
        </Fieldset>
    );
};

export default OrderComments;
