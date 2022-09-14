import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '../locale';
import { CheckboxFormField, Fieldset } from '../ui/form';

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string }> = ({ url }) => (
    <CheckboxFormField
        labelContent={<TranslatedHtml data={{ url }} id="privacy_policy.label" />}
        name="privacyPolicy"
    />
);

const PrivacyPolicyFieldset: FunctionComponent<{ url: string }> = ({ url }) => (
    <Fieldset additionalClassName="checkout-privacy-policy">
        <PrivacyPolicyCheckboxFieldLink url={url} />
    </Fieldset>
);

export default memo(PrivacyPolicyFieldset);
