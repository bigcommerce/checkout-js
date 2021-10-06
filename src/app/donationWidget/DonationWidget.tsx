/* eslint-disable react/jsx-no-bind */
import { Checkout, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { Button, ButtonSize, ButtonVariant } from '../ui/button';

export interface WithCheckoutDonationWidgetProps {
    checkout: Checkout;
    cartUrl: string;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
}

const DonationWidget: FunctionComponent = () => {
    return(
         <>
                         <svg height="72" viewBox="0 0 72 72" width="72" xmlns="http://www.w3.org/2000/svg">
                    <style type="text/css">
{ '\
                        .st0{fill:#7AA92432;stroke:#7AA924;stroke-width:2;}\
                        .st1{fill:#7AA92432;stroke:#7AA924;stroke-width:2;stroke-linecap:round;}\
                        ' }
</style>
                    <path
                        className="st0"
                        d="M42.2 39c-0.2 0.1-0.3 0.2-0.6 0.2s-0.4-0.1-0.6-0.2L28.5 27.1c-6-5.7-6.4-11.6-2.5-15.2 3.8-3.6 10.1-3.6 13.9 0 0.7 0.7 1.3 1.4 1.8 2.2 0.5-0.8 1-1.5 1.8-2.2 3.8-3.7 10.1-3.7 13.9 0 3.8 3.6 3.5 9.5-2.6 15.2L42.2 39z"
                    />
                    <path
                        className="st1"
                        d="M27.1 51.1l4.9 3.1c1.5 1 3.3 1.5 5 1.4l9.9-0.3c1.4 0 2.5-1.3 2.5-2.8l0-0.1c0-1.5-1.1-2.8-2.6-2.9 -3-0.1-7.7-0.3-7.7-0.3 -2.1-0.1-4.3-0.5-6-1.9l-1.8-1.7c-3.8-3.9-9.3-4.9-14.2-2.6l0 0c-0.8 0.4-1.8 0.6-2.7 0.6H13c-1.4 0-2.5 1.2-2.5 2.7v8.2c0 1.5 1.1 2.7 2.5 2.7h0.9c2.5 0 5.1 0.6 7.4 1.7l5.6 2.7c1.7 0.8 3.6 1.3 5.5 1.3h15.3c0.8 0 1.5-0.4 2-1l11.3-14.5c0.7-0.9 0.9-2.5 0.1-3.5l0 0c-1-0.9-2.5-0.4-3.5 0.4l-8.2 7.2"
                    />
                </svg>
         <div>
            <Button
                onClick={ () => {window.location.href = '/cart.php?action=buy&sku=don-5&qty=1'; } }
                size={ ButtonSize.Tiny }
                testId="donate5"
                variant={ ButtonVariant.Secondary }
            >
                $5
            </Button>
            <Button
                onClick={ () => {window.location.href = '/cart.php?action=buy&sku=don-5&qty=2'; } }
                size={ ButtonSize.Tiny }
                testId="donate10"
                variant={ ButtonVariant.Secondary }
            >
                $10
            </Button>
            <Button
                onClick={ () => {window.location.assign('/cart.php?action=buy&sku=don-5&qty=3'); } }
                size={ ButtonSize.Tiny }
                testId="donate15"
                variant={ ButtonVariant.Secondary }
            >
                $15
            </Button>
            <Button
                onClick={ () => {window.location.href = '/cart.php?action=buy&sku=don-5&qty=4'; } }
                size={ ButtonSize.Tiny }
                testId="donate20"
                variant={ ButtonVariant.Secondary }
            >
                $20
            </Button>
            <Button
                onClick={ () => {window.location.href = '/cart.php?action=buy&sku=don-5&qty=5'; } }
                size={ ButtonSize.Tiny }
                testId="donate25"
                variant={ ButtonVariant.Secondary }
            >
                $25
            </Button>
        </div>
</>
    );
};

export default DonationWidget;
