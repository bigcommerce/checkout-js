import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
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

const PrivacyPolicyAutoConsent: FunctionComponent<{ url: string, themeV2?: boolean }> = ({ url, themeV2 }) => (
    <p className={themeV2 ? 'body-regular' : ''}>
        <TranslatedHtml data={{ url }} id="privacy_policy_auto_consent.label" />
    </p>
);

const PrivacyPolicyField: FunctionComponent<{ url: string; isExpressPrivacyPolicy: boolean }> = ({
    url,
    isExpressPrivacyPolicy,
}) => {
    const { themeV2 } = useThemeContext();

    if (isExpressPrivacyPolicy) {
        return <PrivacyPolicyAutoConsent themeV2={themeV2} url={url} />;
    }

    return <PrivacyPolicyFieldset url={url} />;
};

export default memo(PrivacyPolicyField);
