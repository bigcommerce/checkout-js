import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { PrimaryHeader } from '../ui/header';

export interface HeaderProps {
    name?: string;
}

const ThankYouHeader: FunctionComponent<HeaderProps> = ({ name }) => (
    <PrimaryHeader testId="order-confirmation-heading">
        {name && (
            <TranslatedString data={{ name }} id="order_confirmation.thank_you_customer_heading" />
        )}

        {!name && <TranslatedString id="order_confirmation.thank_you_heading" />}
    </PrimaryHeader>
);

export default memo(ThankYouHeader);
