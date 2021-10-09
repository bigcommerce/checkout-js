import React, { FunctionComponent } from 'react';

import DonationWidget from './DonationWidget';

const DonationWidgetMobile: FunctionComponent = () => (
    <div data-test="cart" id="donationWidget">
        <div className="cart-header">
            <h3 className="cart-title optimizedCheckout-headingSecondary">
                { 'Donate to Focus on the Family' }
            </h3>
        </div>

        <div className="cart-section optimizedCheckout-orderSummary-cartSection">
            <DonationWidget
                { ...{ widgetIsMobile: false } }
            />
        </div>
    </div>);

export default DonationWidgetMobile;
