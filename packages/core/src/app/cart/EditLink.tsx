import React, { FunctionComponent, memo, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ConfirmationModal } from '@bigcommerce/checkout/ui';

export interface EditLinkProps {
    className?: string;
    isMultiShippingMode: boolean;
    url: string;
}

const EditLink: FunctionComponent<EditLinkProps> = ({ className, url, isMultiShippingMode }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const gotoCartPage = () => {
        window.location.assign(url);
    };

    if (isMultiShippingMode) {
        return (
            <>
                <ConfirmationModal
                    action={gotoCartPage}
                    headerId="cart.edit_cart_action"
                    isModalOpen={isModalOpen}
                    messageId="cart.edit_multi_shipping_cart_message"
                    onRequestClose={() => setIsModalOpen(false)}
                />
                <a
                    className={className || 'cart-header-link'}
                    data-test="cart-edit-link"
                    href="#"
                    id="cart-edit-link"
                    onClick={preventDefault(() => setIsModalOpen(true))}
                >
                    <TranslatedString id="cart.edit_cart_action" />
                </a>
            </>
        );
    }

    return (
        <a
            className={className || 'cart-header-link'}
            data-test="cart-edit-link"
            href={url}
            id="cart-edit-link"
            target="_top"
        >
            <TranslatedString id="cart.edit_cart_action" />
        </a>
    );
};

export default memo(EditLink);
