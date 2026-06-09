import React, { type FunctionComponent } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { hideEditCartLink } from '@bigcommerce/checkout/utility';

import EditLink from './EditLink';

interface CartHeaderLinkProps {
    cartUrl: string;
    isBuyNowCart: boolean;
    isMultiShippingMode: boolean;
    className?: string;
    label?: React.ReactNode;
}

export const CartHeaderLink: FunctionComponent<CartHeaderLinkProps> = ({
    cartUrl,
    className,
    isBuyNowCart,
    isMultiShippingMode,
    label,
}) => {
    const {
        userJourney: { disableEditCart },
        orderConfirmation: { invoiceRedirect },
    } = useCapabilities();

    if (invoiceRedirect) {
        return <EditLink className={className} isInvoiceRedirectEnabled={true} />;
    }

    if (hideEditCartLink(isBuyNowCart, disableEditCart)) {
        return null;
    }

    return (
        <EditLink
            className={className}
            isMultiShippingMode={isMultiShippingMode}
            label={label}
            url={cartUrl}
        />
    );
};
