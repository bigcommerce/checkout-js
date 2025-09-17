import React, { type ReactElement } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Button, ButtonVariant } from '../../ui/button';

export const ContinueButton = ({ siteLink }:{siteLink: string}): ReactElement => (
    <div className="continueButtonContainer">
        <form action={siteLink} method="get" target="_top">
            <Button type="submit" variant={ButtonVariant.Secondary}>
                <TranslatedString id="order_confirmation.continue_shopping" />
            </Button>
        </form>
    </div>
);
