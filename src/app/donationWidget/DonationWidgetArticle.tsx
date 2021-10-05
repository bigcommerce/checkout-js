import React, { FunctionComponent } from 'react';

import OrderSummaryHeader from '../order/OrderSummaryHeader';
import OrderSummarySection from '../order/OrderSummarySection';

import DonationWidget from './DonationWidget';

const DonationWidgetArticle: FunctionComponent = () => (
    <article className="cart optimizedCheckout-orderSummary" data-test="cart" id="donationWidget">
        <OrderSummaryHeader>
            { 'Donate to Focus on the Family' }
        </OrderSummaryHeader>

        <OrderSummarySection>
            <DonationWidget />
        </OrderSummarySection>
    </article>);

export default DonationWidgetArticle;
