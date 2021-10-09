import React, { FunctionComponent } from 'react';

import OrderSummaryHeader from '../order/OrderSummaryHeader';
import OrderSummarySection from '../order/OrderSummarySection';

import DonationWidget from './DonationWidget';

const DonationWidgetArticle: FunctionComponent = () => (
    <article id="donationWidget" className="cart optimizedCheckout-orderSummary" data-test="cart">
        <OrderSummaryHeader>
        </OrderSummaryHeader>

        <OrderSummarySection>
            <DonationWidget
                { ...{ widgetIsMobile: false } }
            />
        </OrderSummarySection>
    </article>);

export default DonationWidgetArticle;
