import React, { memo, FunctionComponent } from 'react';

import { IconCardAmex, IconCardCarnet, IconCardCB, IconCardDankort, IconCardDinersClub, IconCardDiscover, IconCardElo, IconCardHipercard, IconCardJCB, IconCardMada, IconCardMaestro, IconCardMastercard, IconCardTroy, IconCardUnionPay, IconCardVisa, IconSize } from '../../ui/icon';

export interface CreditCardIconProps {
    cardType?: string;
}

const CreditCardIcon: FunctionComponent<CreditCardIconProps> = ({
    cardType,
}) => {
    const iconProps = {
        additionalClassName: 'cardIcon-icon',
        size: IconSize.Medium,
        testId: `credit-card-icon-${cardType || 'default'}`,
    };

    switch (cardType) {
    case 'american-express':
        return <IconCardAmex { ...iconProps } />;

    case 'carnet':
        return <IconCardCarnet { ...iconProps } />;

    case 'cb':
        return <IconCardCB { ...iconProps } />;

    case 'dankort':
        return <IconCardDankort { ...iconProps } />;

    case 'diners-club':
        return <IconCardDinersClub { ...iconProps } />;

    case 'discover':
        return <IconCardDiscover { ...iconProps } />;

    case 'elo':
        return <IconCardElo { ...iconProps } />;

    case 'hiper':
        return <IconCardHipercard { ...iconProps } />;

    case 'jcb':
        return <IconCardJCB { ...iconProps } />;

    case 'mada':
        return <IconCardMada { ...iconProps } />;

    case 'maestro':
        return <IconCardMaestro { ...iconProps } />;

    case 'mastercard':
        return <IconCardMastercard { ...iconProps } />;

    case 'troy':
        return <IconCardTroy { ...iconProps } />;

    case 'unionpay':
        return <IconCardUnionPay { ...iconProps } />;

    case 'visa':
        return <IconCardVisa { ...iconProps } />;

    default:
        return <div className="cardIcon-icon cardIcon-icon--default icon icon--medium" />;
    }
};

export default memo(CreditCardIcon);
