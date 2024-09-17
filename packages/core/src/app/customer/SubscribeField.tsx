import { FieldProps } from 'formik';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { Input, Label } from '../ui/form';

export type SubscribeFieldProps = FieldProps<boolean> & {
    requiresMarketingConsent: boolean;
};

const SubscribeField: FunctionComponent<SubscribeFieldProps> = ({
    field,
    requiresMarketingConsent,
}) => (
    <>
        <Input
            {...field}
            checked={field.value}
            className="form-checkbox"
            id={field.name}
            testId="should-subscribe-checkbox"
            type="checkbox"
        />

        <Label htmlFor={field.name}>
            <TranslatedHtml
                id={
                    requiresMarketingConsent
                        ? 'customer.guest_marketing_consent'
                        : 'customer.guest_subscribe_to_newsletter_text'
                }
            />
        </Label>
    </>
);

export default memo(SubscribeField);
