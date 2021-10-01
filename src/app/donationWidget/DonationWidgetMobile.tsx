import React, { FunctionComponent } from 'react';

import DonationWidget from './DonationWidget';

const DonationWidgetMobile: FunctionComponent = () => (
    <div id="donationWidget" className="cart optimizedCheckout-orderSummary" data-test="cart">
        <div className="cart-header">
            <h3 className="cart-title optimizedCheckout-headingSecondary">
                { "Donate to Focus on the Family"}
            </h3>
        </div>

        <div className="cart-section optimizedCheckout-orderSummary-cartSection">
            <DonationWidget />
        </div>
    </div>;
);

export default DonationWidgetMobile;
