import React, { type FunctionComponent, memo, Suspense } from 'react';

import { getPaymentMethodIconComponent } from './mapFromPaymentMethodCardType';
import { IconSize } from './IconContainer';

export interface CreditCardIconProps {
    cardType?: string;
}

const CreditCardIcon: FunctionComponent<CreditCardIconProps> = ({ cardType }) => {
    const iconProps = {
        additionalClassName: 'cardIcon-icon',
        size: IconSize.Medium,
        testId: `credit-card-icon-${cardType || 'default'}`,
    };

    const IconComponent = getPaymentMethodIconComponent(cardType);

    return IconComponent ? (
        <Suspense>
            <IconComponent {...iconProps} />
        </Suspense>
    ) : (
        <div className="cardIcon-icon cardIcon-icon--default icon icon--medium" />
    );
};

export default memo(CreditCardIcon);
