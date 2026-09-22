import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Fieldset, FormField, Label, Legend, TextInput } from '@bigcommerce/checkout/ui';

const OrderComments: FunctionComponent = () => {
    const { enhancedThemeV1 } = useThemeContext();
    const orderCommentLabelId = enhancedThemeV1
        ? 'shipping.order_comment_label_v2'
        : 'shipping.order_comment_label';

    const renderLabel = useCallback(
        (name: string) => (
            <Label hidden htmlFor={name}>
                <TranslatedString id={orderCommentLabelId} />
            </Label>
        ),
        [orderCommentLabelId],
    );

    const renderInput = useCallback(
        ({ field }: FieldProps) => (
            <TextInput {...field} autoComplete="off" id="orderComment" maxLength={2000} />
        ),
        [],
    );

    const legend = useMemo(
        () => (
            <Legend>
                <TranslatedString id={orderCommentLabelId} />
            </Legend>
        ),
        [orderCommentLabelId],
    );

    return (
        <Fieldset legend={legend} testId="checkout-shipping-comments">
            <FormField
                id="orderComment"
                input={renderInput}
                label={renderLabel}
                name="orderComment"
            />
        </Fieldset>
    );
};

export default OrderComments;
