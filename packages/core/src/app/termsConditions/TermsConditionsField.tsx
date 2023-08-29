import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { parseAnchor } from '@bigcommerce/checkout/dom-utils';
import { TranslatedHtml, TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { CheckboxFormField, Fieldset, FormField, Legend, TextArea } from '../ui/form';
import { ModalHeader, ModalLink } from '../ui/modal';
import { MultiLineText } from '../ui/text';

export enum TermsConditionsType {
    Link = 'link',
    TextArea = 'textarea',
    Modal = 'modal',
}

export type TermsConditionsFieldProps =
    | TermsConditionsLinkFieldProps
    | TermsConditionsTextAreaFieldProps;

interface TermsConditionsLinkFieldProps {
    name: string;
    type: TermsConditionsType.Link;
    url: string;
}

interface TermsConditionsTextAreaFieldProps {
    name: string;
    terms: string;
    type: TermsConditionsType.TextArea | TermsConditionsType.Modal;
}

interface TermsConditionsTextFieldProps {
    name: string;
    terms: string;
}

const BaseTermsConditionsModalCheckboxField: FunctionComponent<
    TermsConditionsTextFieldProps & WithLanguageProps
> = ({ language, name, terms }) => {
    const translatedLabel = language.translate('terms_and_conditions.agreement_with_link_text', {
        url: '',
    });
    const parsedLabel = parseAnchor(translatedLabel);

    const labelContent = parsedLabel ? (
        <>
            {parsedLabel[0]}
            <ModalLink
                body={<MultiLineText>{terms}</MultiLineText>}
                header={
                    <ModalHeader>
                        <TranslatedString id="terms_and_conditions.heading" />
                    </ModalHeader>
                }
            >
                {parsedLabel[1]}
            </ModalLink>
            {parsedLabel[2]}
        </>
    ) : (
        translatedLabel
    );

    return <CheckboxFormField labelContent={labelContent} name={name} />;
};

const TermsConditionsModalCheckboxField = withLanguage(BaseTermsConditionsModalCheckboxField);

interface TermsConditionsCheckboxFieldProps {
    name: string;
    type: TermsConditionsType;
    url?: string;
}

const TermsConditionsCheckboxField: FunctionComponent<TermsConditionsCheckboxFieldProps> = ({
    name,
    url,
}) => {
    const labelContent = useMemo(
        () =>
            url ? (
                <TranslatedHtml data={{ url }} id="terms_and_conditions.agreement_with_link_text" />
            ) : (
                <TranslatedString id="terms_and_conditions.agreement_text" />
            ),
        [url],
    );

    return <CheckboxFormField labelContent={labelContent} name={name} />;
};

const TermsConditionsTextField: FunctionComponent<TermsConditionsTextFieldProps> = ({
    name,
    terms,
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps) => <TextArea defaultValue={terms} name={field.name} readOnly />,
        [terms],
    );

    return <FormField input={renderInput} name={`${name}Text`} />;
};

const TermsConditionsFieldset: FunctionComponent<TermsConditionsFieldProps> = (props) => {
    const { type } = props;

    return (
        <Fieldset
            additionalClassName="checkout-terms"
            legend={
                <Legend>
                    <TranslatedString id="terms_and_conditions.terms_and_conditions_heading" />
                </Legend>
            }
        >
            {isTermsConditionsTextArea(props) && <TermsConditionsTextField {...props} />}
            {isTermsConditionModal(props) && type === TermsConditionsType.Modal ? (
                <TermsConditionsModalCheckboxField {...props} />
            ) : (
                <TermsConditionsCheckboxField {...props} />
            )}
        </Fieldset>
    );
};

function isTermsConditionsTextArea(props: any): props is TermsConditionsTextFieldProps {
    return props.type === TermsConditionsType.TextArea;
}

function isTermsConditionModal(props: any): props is TermsConditionsTextFieldProps {
    return props.type === TermsConditionsType.Modal;
}

export default memo(TermsConditionsFieldset);
