import { FieldProps } from 'formik';
import React, { Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../language';
import { Input, Label } from '../ui/form';

export type SubscribeFieldProps = FieldProps<boolean>;

const SubscribeField: FunctionComponent<SubscribeFieldProps> = ({ field }) => (
    <Fragment>
        <Input
            { ...field }
            className="form-checkbox"
            checked={ field.value }
            id={ field.name }
            type="checkbox"
        />

        <Label htmlFor={ field.name }>
            <TranslatedString id="customer.guest_subscribe_to_newsletter_text" />
        </Label>
    </Fragment>
);

export default SubscribeField;
