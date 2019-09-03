import React, { memo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { PrimaryHeader } from '../ui/header';

export interface HeaderProps {
    name?: string;
}

const ThankYouHeader: FunctionComponent<HeaderProps> = ({
    name,
}) => (
    <PrimaryHeader testId="order-confirmation-heading">
        { name && <TranslatedString
            id="order_confirmation.thank_you_customer_heading"
            data={ { name } }
        /> }

        { !name && <TranslatedString
            id="order_confirmation.thank_you_heading"
        /> }
    </PrimaryHeader>
);

export default memo(ThankYouHeader);
