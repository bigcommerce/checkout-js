import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { CheckboxFormField, Fieldset } from '../ui/form';

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string }> = ({ url }) => (
    <CheckboxFormField
        labelContent={<TranslatedHtml data={{ url }} id="privacy_policy.label" />}
        name="privacyPolicy" testId='privacy-policy-checkbox'
    />
);

const PrivacyPolicyFieldset: FunctionComponent<{ url: string }> = ({ url }) => (
    <Fieldset additionalClassName="checkout-privacy-policy">
        <PrivacyPolicyCheckboxFieldLink url={url} />
    </Fieldset>
);

export default memo(PrivacyPolicyFieldset);
