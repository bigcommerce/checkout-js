import React, { FunctionComponent } from 'react';

import './TermsConditions.scss';
import TermsConditionsField, { TermsConditionsType } from './TermsConditionsField';

export interface TermsConditionsProps {
    termsConditionsText?: string;
    termsConditionsUrl?: string;
}

export const TermsConditions: FunctionComponent<TermsConditionsProps> = ({
    termsConditionsUrl,
    termsConditionsText = '',
}) => (
    <>
        { termsConditionsUrl ?
            <TermsConditionsField
                name="terms"
                type={ TermsConditionsType.Link }
                url={ termsConditionsUrl }
            /> :
            <TermsConditionsField
                name="terms"
                terms={ termsConditionsText }
                type={ TermsConditionsType.TextArea }
            /> }
    </>
);
