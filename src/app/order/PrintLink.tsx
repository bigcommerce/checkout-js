import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { IconPrint } from '../ui/icon';

export interface PrintLinkProps {
    className?: string;
}

const PrintLink: FunctionComponent<PrintLinkProps> = ({ className }) => {
    if (typeof window.print !== 'function') {
        return null;
    }

    return (
        <a
            className={ className || 'cart-header-link' }
            onClick={ () => window.print() }
            id="cart-print-link"
        >
            <IconPrint />&nbsp;
        <TranslatedString id="cart.print_action" />
        </a>
    );
};

export default PrintLink;
