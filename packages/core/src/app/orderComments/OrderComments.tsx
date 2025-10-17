import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Fieldset, FormField, Label, Legend, TextInput } from '../ui/form';

const OrderComments: FunctionComponent = () => {
    const { themeV2 } = useThemeContext();

    const renderLabel = useCallback(
        (name: string) => (
            <Label hidden htmlFor={name}>
                <TranslatedString id="shipping.order_comment_label" />
            </Label>
        ),
        [],
    );

    const renderInput = useCallback(
        ({ field }: FieldProps) => <TextInput {...field} autoComplete="off" id="orderComment" maxLength={2000} themeV2={themeV2} />,
        [],
    );

    const legend = useMemo(
        () => (
            <Legend themeV2={themeV2}>
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
