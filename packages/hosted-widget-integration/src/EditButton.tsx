import classNames from 'classnames';
import React, { type ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

interface EditButtonProps {
    buttonId: string | undefined;
    shouldShowEditButton: boolean | undefined;
}

export const EditButton = ({ buttonId, shouldShowEditButton }: EditButtonProps): ReactNode => {
    if (shouldShowEditButton) {
        const translatedString = <TranslatedString id="remote.select_different_card_action" />;

        return (
            <p>
                <button
                    className={classNames('stepHeader', 'widget-link-amazonpay')}
                    id={buttonId}
                    onClick={preventDefault()}
                    type="button"
                >
                    {translatedString}
                </button>
            </p>
        );
    }

    return null;
};
