import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../locale';
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

interface TermsConditionsTextFieldProps {
    name: string;
    terms: string;
}

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
            name={ `${name}Text` }
            input={ renderInput }
        />
    );
};

interface TermsConditionsCheckboxFieldProps {
    name: string;
    url?: string;
}

const TermsConditionsCheckboxField: FunctionComponent<TermsConditionsCheckboxFieldProps> = ({
    name,
    url,
}) => {
    const labelContent = useMemo(() => (
        url ?
            <TranslatedHtml id="terms_and_conditions.agreement_with_link_text" data={ { url } } /> :
            <TranslatedString id="terms_and_conditions.agreement_text" />
    ), [url]);

    return (
        <CheckboxFormField
            name={ name }
            labelContent={ labelContent }
        />
    );
};

const TermsConditionsField: FunctionComponent<TermsConditionsFieldProps> = props => {
    return (
        <Fieldset
            additionalClassName="checkout-terms"
            legend={ <Legend>
                <TranslatedString id="terms_and_conditions.terms_and_conditions_heading" />
            </Legend> }
        >
            { areTermsConditionsTextFieldProps(props) && <TermsConditionsTextField { ...props } /> }

            <TermsConditionsCheckboxField { ...props } />
        </Fieldset>
    );
};

function areTermsConditionsTextFieldProps(props: any): props is TermsConditionsTextFieldProps {
    return props.type === TermsConditionsType.TextArea;
}

export default memo(TermsConditionsField);
