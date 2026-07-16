import { type FormField, isExtraField } from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { DynamicFormField, DynamicFormFieldType } from '@bigcommerce/checkout/ui';

interface OrderExtraFieldsFieldsetProps {
    formFields: FormField[];
    isFloatingLabelEnabled?: boolean;
}

const OrderExtraFieldsFieldset: FunctionComponent<OrderExtraFieldsFieldsetProps> = ({
    formFields,
    isFloatingLabelEnabled,
}) => {
    const { language } = useLocale();
    const extraFields = formFields.filter((field) => isExtraField(field));

    if (extraFields.length === 0) {
        return null;
    }

    return (
        <div data-test="order-extra-fields">
            {extraFields.map((field) => (
                <DynamicFormField
                    field={field}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    key={`${field.id}-${field.name}`}
                    label={field.label}
                    parentFieldName="orderExtraFields"
                    placeholder={
                        field.fieldType === DynamicFormFieldType.DROPDOWN
                            ? language.translate('common.please_select_text')
                            : undefined
                    }
                />
            ))}
        </div>
    );
};

export default OrderExtraFieldsFieldset;
