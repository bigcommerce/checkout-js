import { FieldProps } from 'formik';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { Input, Label } from '../ui/form';
import { useStyleContext } from '../checkout/useStyleContext';

export type SubscribeFieldProps = FieldProps<boolean> & {
    requiresMarketingConsent: boolean;
};

const SubscribeField: FunctionComponent<SubscribeFieldProps> = ({
    field,
    requiresMarketingConsent,
}) => {
    const { newFontStyle } = useStyleContext();
    return (
        <>
            <Input
                {...field}
                checked={field.value}
                className="form-checkbox"
                id={field.name}
                testId="should-subscribe-checkbox"
                type="checkbox"
                value={String(field.value)}
            />

            <Label
                htmlFor={field.name}
                additionalClassName={newFontStyle ? 'body-regular' : ''}
            >
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
}

export default memo(SubscribeField);
