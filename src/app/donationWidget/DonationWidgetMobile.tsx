import React, { FunctionComponent } from 'react';

import DonationWidget from './DonationWidget';

const DonationWidgetMobile: FunctionComponent = () => (
<<<<<<< HEAD
    <div data-test="cart" id="donationWidget">
=======
    <div className="cart optimizedCheckout-orderSummary" data-test="cart" id="donationWidget">
>>>>>>> fix: fix some linting errors
        <div className="cart-header">
            <h3 className="cart-title optimizedCheckout-headingSecondary">
                { 'Donate to Focus on the Family' }
            </h3>
        </div>

        <div className="cart-section optimizedCheckout-orderSummary-cartSection">
            <DonationWidget />
        </div>
<<<<<<< HEAD
    </div>);
=======
    </div>
);
>>>>>>> fix: fix some linting errors

export default DonationWidgetMobile;
