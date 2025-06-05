import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { CheckboxFormField, Fieldset } from '../ui/form';
import { useStyleContext } from '../checkout/useStyleContext';

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string, newFontStyle?: boolean }> = ({ url, newFontStyle }) => (
    <CheckboxFormField
        labelContent={<TranslatedHtml data={{ url }} id="privacy_policy.label" />}
        name="privacyPolicy"
        testId="privacy-policy-checkbox"
        newFontStyle={newFontStyle}
    />
);

const PrivacyPolicyFieldset: FunctionComponent<{ url: string, newFontStyle?: boolean }> = ({ url, newFontStyle }) => (
    <Fieldset additionalClassName="checkout-privacy-policy">
        <PrivacyPolicyCheckboxFieldLink url={url} newFontStyle={newFontStyle} />
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
    const { newFontStyle } = useStyleContext();

    if (isExpressPrivacyPolicy) {
        return <PrivacyPolicyAutoConsent url={url} newFontStyle={newFontStyle} />;
    }

    return <PrivacyPolicyFieldset url={url} newFontStyle={newFontStyle} />;
};

export default memo(PrivacyPolicyField);
