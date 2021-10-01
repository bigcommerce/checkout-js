import { Checkout, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import DonationWidget from './DonationWidget';

const DonationWidgetAritcle: FunctionComponent = () => (
    <article id="donationWidget" className="cart optimizedCheckout-orderSummary" data-test="cart">
        <OrderSummaryHeader>
            { "Donate to Focus on the Family"}
        </OrderSummaryHeader>

        <OrderSummarySection>
            <DonationWidget />
        </OrderSummarySection>
    </article>;

export default DonationWidgetArticle;
