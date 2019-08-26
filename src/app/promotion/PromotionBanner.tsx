import DOMPurify from 'dompurify';
import React, { memo, FunctionComponent } from 'react';

import { Alert, AlertType } from '../ui/alert';
import { IconTag } from '../ui/icon';

export interface PromotionBannerProps {
    message: string;
}

const PromotionBanner: FunctionComponent<PromotionBannerProps> = ({
    message,
}) => (
    <Alert
        additionalClassName="optimizedCheckout-discountBanner"
        icon={ <IconTag /> }
        type={ AlertType.Info }
    >
        <span
            data-test="promotion-banner-message"
            dangerouslySetInnerHTML={ {
                __html: DOMPurify.sanitize(message),
            } }
        />
    </Alert>
);

export default memo(PromotionBanner);
