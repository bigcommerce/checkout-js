import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { Fieldset, FormField, Label, Legend, TextInput } from '../ui/form';

const OrderComments: FunctionComponent = () => (
    <Fieldset testId="checkout-shipping-comments"
        legend={
            <Legend>
                <TranslatedString id="shipping.order_comment_label" />
            </Legend>
        }
    >
        <FormField
            name="orderComment"
            label={ name => (
                <Label hidden htmlFor={ name }>
                    <TranslatedString id="shipping.order_comment_label" />
                </Label>
            ) }
            input={ ({ field }) => (
                <TextInput
                    { ...field }
                    maxLength={ 2000 }
                    autoComplete={'off'}
                />
            )}
        />
    </Fieldset>
);

export default OrderComments;
