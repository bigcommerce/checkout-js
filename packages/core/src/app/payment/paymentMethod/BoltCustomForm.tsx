import React, { FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../../ui/form';

export interface BoltCustomFormProps {
    containerId: string;
    showCreateAccountCheckbox: boolean;
}

const agreementTranslationOptions = {
    privacyPolicyUrl: 'https://www.bolt.com/privacy/',
    termsUrl: 'https://www.bolt.com/end-user-terms/',
};

const benefitsList = [
    { id: 'payment.bolt_benefit_1' },
    { id: 'payment.bolt_benefit_2' },
    { id: 'payment.bolt_benefit_3' },
];

const BoltCreateAccountCheckbox: FunctionComponent = () => {
    const labelContent = (
        <>
            <TranslatedHtml
                data={agreementTranslationOptions}
                id="payment.bolt_checkbox_agreement"
            />
            <ul>
                {benefitsList.map(({ id }, key) => (
                    <li key={key}>
                        <TranslatedString id={id} />
                    </li>
                ))}
            </ul>
        </>
    );

    return (
        <CheckboxFormField
            additionalClassName="form-checkbox form-field--createAccount"
            labelContent={labelContent}
            name="shouldCreateAccount"
        />
    );
};

const BoltCustomForm: FunctionComponent<BoltCustomFormProps> = ({
    containerId,
    showCreateAccountCheckbox,
}) => {
    return (
        <div className="form-ccFields">
            <div className="form-field form-field--bolt-embed" id={containerId} />
            {showCreateAccountCheckbox ? <BoltCreateAccountCheckbox /> : null}
        </div>
    );
};

export default BoltCustomForm;
