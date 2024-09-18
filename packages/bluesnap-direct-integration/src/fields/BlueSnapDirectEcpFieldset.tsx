import { LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import BlueSnapDirectNumberField from './BlueSnapDirectNumberField';
import BlueSnapDirectSelectField from './BlueSnapDirectSelectField';

export interface BlueSnapDirectEcpFieldsetProps {
    language: LanguageService;
    useFloatingLabel?: boolean;
}

const BlueSnapDirectEcpFieldset: FunctionComponent<BlueSnapDirectEcpFieldsetProps> = ({
    language,
    useFloatingLabel,
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
        <>
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
        </>
    );
};

export default memo(BlueSnapDirectEcpFieldset);
