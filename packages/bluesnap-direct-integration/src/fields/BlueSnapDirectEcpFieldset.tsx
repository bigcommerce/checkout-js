import { type LanguageService } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { BluesnapECPAccountType } from '../constants';

import BlueSnapDirectNumberField from './BlueSnapDirectNumberField';
import BlueSnapDirectSelectField from './BlueSnapDirectSelectField';
import BlueSnapDirectTextField from './BlueSnapDirectTextField';

export interface BlueSnapDirectEcpFieldsetProps {
    language: LanguageService;
    useFloatingLabel?: boolean;
    shouldRenderCompanyName: boolean;
}

const BlueSnapDirectEcpFieldset: FunctionComponent<BlueSnapDirectEcpFieldsetProps> = ({
    language,
    useFloatingLabel,
    shouldRenderCompanyName,
}) => {
    const options = {
        helperLabel: language.translate('payment.bluesnap_direct_account_type_select.label'),
        items: [
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_consumer_checking',
                ),
                value: BluesnapECPAccountType.ConsumerChecking,
            },
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_consumer_savings',
                ),
                value: BluesnapECPAccountType.ConsumerSavings,
            },
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_corporate_checking',
                ),
                value: BluesnapECPAccountType.CorporateChecking,
            },
            {
                label: language.translate(
                    'payment.bluesnap_direct_account_type_select.option_corporate_savings',
                ),
                value: BluesnapECPAccountType.CorporateSavings,
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
            {shouldRenderCompanyName && (
                <BlueSnapDirectTextField
                    labelContent={language.translate('address.company_name_label')}
                    name="companyName"
                    useFloatingLabel={useFloatingLabel}
                />
            )}
        </>
    );
};

export default memo(BlueSnapDirectEcpFieldset);
