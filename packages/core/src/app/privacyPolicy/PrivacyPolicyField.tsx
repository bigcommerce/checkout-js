import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { CheckboxFormField, Fieldset } from '../ui/form';

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string }> = ({ url }) => (
    <CheckboxFormField
        labelContent={<TranslatedHtml data={{ url }} id="privacy_policy.label" />}
        name="privacyPolicy"
        testId="privacy-policy-checkbox"
    />
);

const PrivacyPolicyFieldset: FunctionComponent<{ url: string }> = ({ url }) => (
    <Fieldset additionalClassName="checkout-privacy-policy">
        <PrivacyPolicyCheckboxFieldLink url={url} />
    </Fieldset>
);

const PrivacyPolicyAutoConsent: FunctionComponent<{ url: string }> = ({ url }) => (
    <p>
        <TranslatedHtml data={{ url }} id="privacy_policy_auto_consent.label" />
    </p>
);

const PrivacyPolicyField: FunctionComponent<{ url: string; isExpressPrivacyPolicy: boolean }> = ({
    url,
    isExpressPrivacyPolicy,
}) => {
    if (isExpressPrivacyPolicy) {
        return <PrivacyPolicyAutoConsent url={url} />;
    }

    return <PrivacyPolicyFieldset url={url} />;
};

export default memo(PrivacyPolicyField);
