import classNames from 'classnames';
import { noop } from 'lodash';
import React, { type FunctionComponent, memo, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { assignLocation, preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ConfirmationModal } from '@bigcommerce/checkout/ui';

import { removeSurcharge } from '../payment/surcharge/requestSurcharge';
import { isSurchargeFee } from '../payment/surcharge/surchargeContract';

export interface EditLinkProps {
    className?: string;
    url?: string;
    isInvoiceRedirectEnabled?: boolean;
    isMultiShippingMode?: boolean;
    label?: React.ReactNode;
}

const EditLink: FunctionComponent<EditLinkProps> = ({
    className,
    url = '',
    isMultiShippingMode = false,
    isInvoiceRedirectEnabled = false,
    label,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {
        selectedState: { checkoutId, hasSurchargeFee },
    } = useCheckout(({ data }) => ({
        checkoutId: data.getCheckout()?.id,
        hasSurchargeFee: Boolean(data.getCheckout()?.fees.some(isSurchargeFee)),
    }));

    // PoC surcharge: leaving for the cart page changes the order, so the card surcharge fee (and its
    // token) would no longer match. Remove it first, and leave anyway if that fails: the payment step
    // removes a leftover fee when it loads.
    const leaveWithoutSurcharge = (leave: () => void) => {
        if (!checkoutId || !hasSurchargeFee) {
            leave();

            return;
        }

        removeSurcharge({ checkoutId }).catch(noop).finally(leave);
    };

    const gotoCartPage = () => {
        leaveWithoutSurcharge(() => assignLocation(url));
    };

    if (isInvoiceRedirectEnabled) {
        return (
            <a
                className={classNames(className || 'cart-header-link', 'body-cta')}
                data-test="cart-edit-link"
                href={url}
                id="cart-edit-link"
                target="_top"
            >
                {label || <TranslatedString id="cart.back_to_invoices" />}
            </a>
        );
    }

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
                    className={classNames(className || 'cart-header-link', 'body-cta')}
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
            className={classNames(className || 'cart-header-link', 'body-cta')}
            data-test="cart-edit-link"
            href={url}
            id="cart-edit-link"
            onClick={(event) => {
                if (!checkoutId || !hasSurchargeFee) {
                    return;
                }

                event.preventDefault();
                leaveWithoutSurcharge(() => window.open(url, '_top'));
            }}
            target="_top"
        >
            {label || <TranslatedString id="cart.edit_cart_action" />}
        </a>
    );
};

export default memo(EditLink);
