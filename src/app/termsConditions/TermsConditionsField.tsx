import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, Fragment, FunctionComponent } from 'react';

import { preventDefault } from '../common/dom';
import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { Button, ButtonSize } from '../ui/button';
import { CheckboxFormField, Fieldset, FormField, Legend, TextArea } from '../ui/form';
import { Modal, ModalHeader, ModalTrigger, ModalTriggerModalProps } from '../ui/modal';

export enum TermsConditionsType {
    Link = 'link',
    TextArea = 'textarea',
    Modal = 'modal',
}

export type TermsConditionsFieldProps = TermsConditionsLinkFieldProps | TermsConditionsTextAreaFieldProps;

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

const BaseTermsConditionsModalCheckboxField: FunctionComponent<TermsConditionsTextFieldProps & WithLanguageProps> = ({
    language,
    name,
    terms,
}) => {
    const renderInput = useCallback(() => (
        <div>
            { terms.split('\n').map((item, key) =>
                <Fragment key={ key }>
                    { item }
                    <br />
                </Fragment>
            ) }
        </div>
    ), [terms]);

    const renderModal = useCallback((props: ModalTriggerModalProps) => (
        <Modal
            { ...props }
            additionalBodyClassName="modal--terms"
            footer={ (
                <Button
                    onClick={ props.onRequestClose }
                    size={ ButtonSize.Small }
                >
                    { language.translate('common.ok_action') }
                </Button>
            ) }
            header={ (
                <ModalHeader>
                    { language.translate('terms_and_conditions.terms_and_conditions_heading') }
                </ModalHeader>
            ) }
            shouldShowCloseButton={ true }
        >
            <FormField
                input={ renderInput }
                name={ `${name}Text` }
            />
        </Modal>
    ), [language, renderInput, name]);

    const termsLabel = language.translate('terms_and_conditions.agreement_with_link_text', { url: '' });
    const termsLabelPrefix = termsLabel.replace(/(<a.*)/g, '');
    const termsLabelSuffix = termsLabel.replace(/.*<\/a>/, '');
    const termsLinkLabelMatches = termsLabel.match(/<a [^>]+>([^<]+)<\/a>/);

    const labelContent = (<>
        { termsLabelPrefix }
        <ModalTrigger modal={ renderModal }>
            { ({ onClick }) => (
                <a onClick={ preventDefault(onClick) }>
                    { termsLinkLabelMatches && termsLinkLabelMatches[1] }
                </a>
            ) }
        </ModalTrigger>
        { termsLabelSuffix }
    </>);

    return (
        <CheckboxFormField
            labelContent={ labelContent }
            name={ name }
        />
    );
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
    const labelContent = useMemo(() => (url ?
        <TranslatedHtml data={ { url } } id="terms_and_conditions.agreement_with_link_text" /> :
        <TranslatedString id="terms_and_conditions.agreement_text" />
    ), [url]);

    return (
        <CheckboxFormField
            labelContent={ labelContent }
            name={ name }
        />
    );
};

const TermsConditionsTextField: FunctionComponent<TermsConditionsTextFieldProps> = ({
    name,
    terms,
}) => {
    const renderInput = useCallback(({ field }: FieldProps) => (
        <TextArea
            defaultValue={ terms }
            name={ field.name }
            readOnly
        />
    ), [terms]);

    return (
        <FormField
            input={ renderInput }
            name={ `${name}Text` }
        />
    );
};

const TermsConditionsFieldset: FunctionComponent<TermsConditionsFieldProps> = props => {
    const { type } = props;

    return (
        <Fieldset
            additionalClassName="checkout-terms"
            legend={ (
                <Legend>
                    <TranslatedString id="terms_and_conditions.terms_and_conditions_heading" />
                </Legend>
            ) }
        >
            { isTermsConditionsTextArea(props) && <TermsConditionsTextField { ...props } /> }
            { isTermsConditionModal(props) && type === TermsConditionsType.Modal ?
                <TermsConditionsModalCheckboxField { ...props } /> :
                <TermsConditionsCheckboxField { ...props } /> }
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
