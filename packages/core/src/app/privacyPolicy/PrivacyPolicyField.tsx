import React, { type FunctionComponent, memo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { CheckboxFormField, Fieldset } from '../ui/form';

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string, themeV2?: boolean }> = ({ url, themeV2 }) => (
    <CheckboxFormField
        labelContent={<TranslatedHtml data={{ url }} id="privacy_policy.label" />}
        name="privacyPolicy"
        testId="privacy-policy-checkbox"
        themeV2={themeV2}
    />
);

const PrivacyPolicyFieldset: FunctionComponent<{ url: string, themeV2?: boolean }> = ({ url, themeV2 }) => (
    <Fieldset additionalClassName="checkout-privacy-policy">
        <PrivacyPolicyCheckboxFieldLink themeV2={themeV2} url={url} />
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

    return <PrivacyPolicyFieldset themeV2={themeV2} url={url} />;
};

export default memo(PrivacyPolicyField);
