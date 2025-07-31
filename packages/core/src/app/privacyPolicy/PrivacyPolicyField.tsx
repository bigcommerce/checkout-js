import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';
import { useThemeContext } from '@bigcommerce/checkout/ui';

import { CheckboxFormField, Fieldset } from '../ui/form';

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string, newFontStyle?: boolean }> = ({ url, newFontStyle }) => (
    <CheckboxFormField
        labelContent={<TranslatedHtml data={{ url }} id="privacy_policy.label" />}
        name="privacyPolicy"
        newFontStyle={newFontStyle}
        testId="privacy-policy-checkbox"
    />
);

const PrivacyPolicyFieldset: FunctionComponent<{ url: string, newFontStyle?: boolean }> = ({ url, newFontStyle }) => (
    <Fieldset additionalClassName="checkout-privacy-policy">
        <PrivacyPolicyCheckboxFieldLink newFontStyle={newFontStyle} url={url} />
    </Fieldset>
);

const PrivacyPolicyAutoConsent: FunctionComponent<{ url: string, newFontStyle?: boolean }> = ({ url, newFontStyle }) => (
    <p className={newFontStyle ? 'body-regular' : ''}>
        <TranslatedHtml data={{ url }} id="privacy_policy_auto_consent.label" />
    </p>
);

const PrivacyPolicyField: FunctionComponent<{ url: string; isExpressPrivacyPolicy: boolean }> = ({
    url,
    isExpressPrivacyPolicy,
}) => {
    const { newFontStyle } = useThemeContext();

    if (isExpressPrivacyPolicy) {
        return <PrivacyPolicyAutoConsent newFontStyle={newFontStyle} url={url} />;
    }

    return <PrivacyPolicyFieldset newFontStyle={newFontStyle} url={url} />;
};

export default memo(PrivacyPolicyField);
