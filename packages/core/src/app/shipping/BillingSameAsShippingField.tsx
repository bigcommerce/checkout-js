import React, { FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../ui/form';
import { useStyleContext } from '../checkout/useStyleContext';

export interface BillingSameAsShippingFieldProps {
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps> = ({
    onChange,
}) => {
    const { newFontStyle } = useStyleContext();

    const labelContent = useMemo(
        () => <TranslatedString id="billing.use_shipping_address_label" />,
        [],
    );

    return (
        <CheckboxFormField
            id="sameAsBilling"
            labelContent={labelContent}
            name="billingSameAsShipping"
            onChange={onChange}
            newFontStyle={newFontStyle}
            testId="billingSameAsShipping"
        />
    );
};

export default memo(BillingSameAsShippingField);
