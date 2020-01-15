import React, { memo, useCallback, Fragment, FunctionComponent } from 'react';

import { preventDefault } from '../common/dom';
import { withLanguage, TranslatedHtml, WithLanguageProps } from '../locale';
import { Button, ButtonSize } from '../ui/button';
import { CheckboxFormField, FormField } from '../ui/form';
import { Modal, ModalHeader, ModalTrigger, ModalTriggerModalProps } from '../ui/modal';

export enum TermsConditionsType {
    Link = 'link',
    TextArea = 'textarea',
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
    type: TermsConditionsType.TextArea;
}

interface TermsConditionsTextFieldProps {
    name: string;
    terms: string;
}

const TermsConditionsModalLink: FunctionComponent<TermsConditionsTextFieldProps & WithLanguageProps> = ({
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

const TermsConditionsTranslatedModalLink = withLanguage(TermsConditionsModalLink);
const TermsConditionsExternalLinkField: FunctionComponent<TermsConditionsLinkFieldProps> = ({ name, url }) => (
    <CheckboxFormField
        labelContent={
            <TranslatedHtml
                data={ { url } }
                id="terms_and_conditions.agreement_with_link_text"
            />
        }
        name={ name }
    />
);

const TermsConditionsCheckboxField: FunctionComponent<TermsConditionsFieldProps> = props => {
    return areTermsConditionsTextFieldProps(props) ?
        <TermsConditionsTranslatedModalLink { ...props } /> :
        <TermsConditionsExternalLinkField { ...props } />;
};

function areTermsConditionsTextFieldProps(props: any): props is TermsConditionsTextFieldProps {
    return props.type === TermsConditionsType.TextArea;
}

export default memo(TermsConditionsCheckboxField);
