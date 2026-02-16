import classNames from 'classnames';
import React, { type FunctionComponent, memo, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ConfirmationModal } from '@bigcommerce/checkout/ui';

export interface EditLinkProps {
    className?: string;
    isMultiShippingMode: boolean;
    url: string;
    label?: React.ReactNode;
}

const EditLink: FunctionComponent<EditLinkProps> = ({ className, url, isMultiShippingMode, label }) => {
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
                    className={classNames((className || 'cart-header-link'),
                        'body-cta')}
                    data-test="cart-edit-link"
                    href="#"
                    id="cart-edit-link"
                    onClick={preventDefault(() => setIsModalOpen(true))}
                >
                    {label || <TranslatedString id="cart.edit_cart_action" />}
                </a>
            </>
        );
    }

    return (
        <a
            className={classNames((className || 'cart-header-link'),
               'body-cta')}
            data-test="cart-edit-link"
            href={url}
            id="cart-edit-link"
            target="_top"
        >
            {label || <TranslatedString id="cart.edit_cart_action" />}
        </a>
    );
};

export default memo(EditLink);
