import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import OrderConfirmationSection from '../OrderConfirmationSection';

export const RateLimitedPermalinkView: FunctionComponent = () => (
    <div className="layout optimizedCheckout-contentPrimary">
        <div className="layout-main">
            <div className="orderConfirmation">
                <OrderConfirmationSection>
                    <div className="orderConfirmation-rateLimited">
                        <h2>
                            <TranslatedString id="order_confirmation.rate_limited.heading" />
                        </h2>
                        <Alert type={AlertType.Error}>
                            <TranslatedString id="order_confirmation.rate_limited.message" />
                        </Alert>
                    </div>
                </OrderConfirmationSection>
            </div>
        </div>
    </div>
);

export default RateLimitedPermalinkView;
