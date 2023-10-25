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
        helperLabel: language.translate('payment.bluesnap_direct_account_type_select.label'),
        items: [
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_consumer_checking',
                ),
                value: 'CONSUMER_CHECKING',
            },
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_consumer_savings',
                ),
                value: 'CONSUMER_SAVINGS',
            },
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_corporate_checking',
                ),
                value: 'CORPORATE_CHECKING',
            },
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_corporate_savings',
                ),
                value: 'CORPORATE_SAVINGS',
            },
        ],
    };

    return (
        <Fieldset
            legend={
                <Legend hidden>
                    {language.translate('payment.bluesnap_direct_electronic_check_label')}
                </Legend>
            }
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
