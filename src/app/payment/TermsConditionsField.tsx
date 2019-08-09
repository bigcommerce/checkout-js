import React, { FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../language';
import { CheckboxFormField, Fieldset, FormField, Legend, TextArea } from '../ui/form';

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

const TermsConditionsField: FunctionComponent<TermsConditionsFieldProps> = props => {
    return (
        <Fieldset
            additionalClassName="checkout-terms"
            legend={ <Legend>
                <TranslatedString id="terms_and_conditions.terms_and_conditions_heading" />
            </Legend> }
        >
            { props.type === TermsConditionsType.TextArea && <FormField
                name={ `${props.name}Text` }
                input={ ({ field }) => (
                    <TextArea
                        defaultValue={ props.terms }
                        name={ field.name }
                        readOnly
                    />
                ) }
            /> }

            <CheckboxFormField
                name={ props.name }
                labelContent={
                    props.type === TermsConditionsType.Link ?
                        <TranslatedHtml id="terms_and_conditions.agreement_with_link_text" data={ { url: props.url } } /> :
                        <TranslatedString id="terms_and_conditions.agreement_text" />
                }
            />
        </Fieldset>
    );
};

export default TermsConditionsField;
