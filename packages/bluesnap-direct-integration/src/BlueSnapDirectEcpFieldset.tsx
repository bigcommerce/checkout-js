import { LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { CheckboxFormField, Fieldset, Legend } from '@bigcommerce/checkout/ui';

import BlueSnapDirectNumberField from './BlueSnapDirectNumberField';
import BlueSnapDirectSelectField from './BlueSnapDirectSelectField';

export interface BlueSnapDirectEcpFieldsetProps {
    language: LanguageService;
    useFloatingLabel?: boolean;
    onPermissionChange: (shopperPermission: boolean) => void;
}

const BlueSnapDirectEcpFieldset: FunctionComponent<BlueSnapDirectEcpFieldsetProps> = ({
    language,
    useFloatingLabel,
    onPermissionChange,
}) => {
    const options = {
        helperLabel: 'Select an account type',
        items: [
            { label: 'Consumer checking', value: 'CONSUMER_CHECKING' },
            { label: 'Consumer savings', value: 'CONSUMER_SAVINGS' },
            { label: 'Corporate checking', value: 'CORPORATE_CHECKING' },
            { label: 'Corporate savings', value: 'CORPORATE_SAVINGS' },
        ],
    };

    return (
        <Fieldset
            legend={<Legend hidden>Electronic Check (ACH/ECP)</Legend>}
            style={{ paddingBottom: '1rem' }}
        >
            <BlueSnapDirectNumberField
                labelContent={language.translate('payment.bluesnap_direct_account_number.label')}
                maxLength={17}
                name="accountNumber"
                useFloatingLabel={useFloatingLabel}
            />

            <BlueSnapDirectNumberField
                labelContent={language.translate('payment.bluesnap_direct_routing_number.label')}
                maxLength={9}
                name="routingNumber"
                useFloatingLabel={useFloatingLabel}
            />

            <BlueSnapDirectSelectField
                labelContent={language.translate('payment.bluesnap_direct_account_type.label')}
                name="accountType"
                options={options}
                useFloatingLabel={useFloatingLabel}
            />

            <CheckboxFormField
                labelContent={language.translate('payment.bluesnap_direct_permission')}
                name="shopperPermission"
                onChange={onPermissionChange}
            />
        </Fieldset>
    );
};

export default memo(BlueSnapDirectEcpFieldset);
