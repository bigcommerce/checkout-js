import { type FieldProps } from 'formik';
import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { Input, Label } from '../ui/form';

export type SubscribeFieldProps = FieldProps<boolean> & {
    requiresMarketingConsent: boolean;
};

const SubscribeField: FunctionComponent<SubscribeFieldProps> = ({
    field,
    requiresMarketingConsent,
}) => {
    const { themeV2 } = useThemeContext();

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
                additionalClassName={themeV2 ? 'body-regular' : ''}
                htmlFor={field.name}
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
