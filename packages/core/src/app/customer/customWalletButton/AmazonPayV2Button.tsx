import React, { FunctionComponent, useEffect } from 'react';

import CheckoutButton, { CheckoutButtonProps } from '../CheckoutButton';

const AmazonPayV2Button: FunctionComponent<CheckoutButtonProps> = (props) => {
    useEffect(() => {
        beautifyAmazonButton();
    }, []);

    return (
        <div className="AmazonPayContainer">
            <CheckoutButton {...props} />
        </div>
    );
}

export default AmazonPayV2Button;

const beautifyAmazonButton = ():void => {
    if (!document.querySelector('.checkout-button-container')) {
        return;
    }

    const container = document.querySelector('#amazonpayCheckoutButton > div') as unknown as HTMLElement;
    const tagline = container?.shadowRoot?.querySelector('.amazonpay-button-view3');

    if (container) {
        container.style.visibility = 'hidden';
        container.style.width = '100%';
    }

    if (tagline) {
        tagline.remove();
        (container?.shadowRoot?.querySelector('.amazonpay-button-view1') as unknown as HTMLElement).style.height = '36px'
        container?.shadowRoot?.querySelector('.amazonpay-button-view2')?.remove();
        container?.shadowRoot?.querySelector('.amazonpay-button-chevrons')?.remove();
        container.style.visibility = 'visible';

        return;
    }

    setTimeout(beautifyAmazonButton, 100);
}
