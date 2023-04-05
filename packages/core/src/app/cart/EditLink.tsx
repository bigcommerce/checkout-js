import React, { FunctionComponent, memo } from 'react';
import TagManager from 'react-gtm-module'

import { TranslatedString } from '../locale';

export interface EditLinkProps {
    className?: string;
    url: string;
}

const EditLink: FunctionComponent<EditLinkProps> = ({ className, url }) => (
    <a
        className={className || 'cart-header-link'}
        data-test="cart-edit-link"
        id="cart-edit-link"
        onClick={() => editCartClick(url)}
    >
        <TranslatedString id="cart.edit_cart_action" />
    </a>
);

const editCartClick = (url: string) => {
    TagManager.initialize({
        gtmId: 'GTM-M7GCSJV',
    })

    const tagManagerArgs = {
        dataLayer: {
            event: 'editCartClick',
        }
    }

    TagManager.dataLayer(tagManagerArgs)

    window.location.href = url
}

export default memo(EditLink);
