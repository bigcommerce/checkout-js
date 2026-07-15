import { type FormField, isExtraField } from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent } from 'react';

import { DynamicFormField } from '@bigcommerce/checkout/ui';

interface OrderExtraFieldsFieldsetProps {
    formFields: FormField[];
    isFloatingLabelEnabled?: boolean;
}

const OrderExtraFieldsFieldset: FunctionComponent<OrderExtraFieldsFieldsetProps> = ({
    formFields,
    isFloatingLabelEnabled,
}) => {
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
                />
            ))}
        </div>
    );
};

export default OrderExtraFieldsFieldset;
