import React, { type FunctionComponent, memo, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../ui/form';

export interface BillingSameAsShippingFieldProps {
    onChange?(isChecked: boolean): void;
}

const BillingSameAsShippingField: FunctionComponent<BillingSameAsShippingFieldProps> = ({
    onChange,
}) => {
    const { themeV2 } = useThemeContext();

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
            testId="billingSameAsShipping"
            themeV2={themeV2}
        />
    );
};

export default memo(BillingSameAsShippingField);
