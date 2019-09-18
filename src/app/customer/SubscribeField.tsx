import { FieldProps } from 'formik';
import React, { memo, Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { Input, Label } from '../ui/form';

export type SubscribeFieldProps = FieldProps<boolean>;

const SubscribeField: FunctionComponent<SubscribeFieldProps> = ({ field }) => (
    <Fragment>
        <Input
            { ...field }
            checked={ field.value }
            className="form-checkbox"
            id={ field.name }
            type="checkbox"
        />

        <Label htmlFor={ field.name }>
            <TranslatedString id="customer.guest_subscribe_to_newsletter_text" />
        </Label>
    </Fragment>
);

export default memo(SubscribeField);
