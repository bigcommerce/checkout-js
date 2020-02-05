import React, { memo, FunctionComponent } from 'react';

import { parseAnchor } from '../common/utility';
import { PrivacyPolicyConfig } from '../customer/Customer';
import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { CheckboxFormField, Fieldset } from '../ui/form';
import { ModalHeader, ModalLink } from '../ui/modal';
import { MultiLineText } from '../ui/text';

export enum PrivacyPolicyType {
    Link = 'link',
    Text = 'text',
}

const BasePrivacyPolicyCheckboxFieldModal: FunctionComponent<WithLanguageProps & { text: string }> = ({
    language,
    text,
}) => {
    const parsedLabel = parseAnchor(language.translate('privacy_policy.label', { url: '' }));

    if (!parsedLabel) {
        return null;
    }

    const labelContent = (<>
        { parsedLabel[0] }
        <ModalLink
            body={ <MultiLineText>{ text }</MultiLineText> }
            header={
                <ModalHeader>
                    <TranslatedString id="privacy_policy.heading" />
                </ModalHeader>
            }
        >
            { parsedLabel[1] }
        </ModalLink>
        { parsedLabel[2] }
    </>);

    return (
        <CheckboxFormField
            labelContent={ labelContent }
            name="privacyPolicy"
        />
    );
};

const PrivacyPolicyCheckboxFieldModal = withLanguage(BasePrivacyPolicyCheckboxFieldModal);

const PrivacyPolicyCheckboxFieldLink: FunctionComponent<{ url: string }> = ({
    url,
}) => (
    <CheckboxFormField
        labelContent={ <TranslatedHtml data={ { url } } id="privacy_policy.label" /> }
        name="privacyPolicy"
    />
);

const PrivacyPolicyFieldset: FunctionComponent<Pick<PrivacyPolicyConfig, 'type' | 'value'>> = ({
    type,
    value,
}) => (
    <Fieldset
        additionalClassName="checkout-privacy-policy"
    >
        { type === PrivacyPolicyType.Text ?
            <PrivacyPolicyCheckboxFieldModal text={ value } /> :
            <PrivacyPolicyCheckboxFieldLink url={ value } /> }
    </Fieldset>
);

export default memo(PrivacyPolicyFieldset);
