import React, { type FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckboxFormField } from '@bigcommerce/checkout/ui';

export interface BillingSameAsShippingFieldProps {
    labelStringId?: string;
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps> = ({
    labelStringId = 'billing.use_shipping_address_label',
    onChange,
}) => {
    const labelContent = useMemo(() => <TranslatedString id={labelStringId} />, [labelStringId]);

    return (
        <CheckboxFormField
            id="sameAsBilling"
            labelContent={labelContent}
            name="billingSameAsShipping"
            onChange={onChange}
            testId="billingSameAsShipping"
        />
    );
};

export default memo(BillingSameAsShippingField);
