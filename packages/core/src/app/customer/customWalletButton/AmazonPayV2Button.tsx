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

const beautifyAmazonButton = (): void => {
    if (!document.querySelector('.checkout-button-container')) {
        return;
    }

    const container = document.querySelector('#amazonpayCheckoutButton > div') as unknown as HTMLElement;
    const amazonButton = container?.shadowRoot?.querySelector('.amazonpay-button-view1') as unknown as HTMLElement;

    if (container && amazonButton) {
        amazonButton.style.height = '36px';
        return;
    }

    setTimeout(beautifyAmazonButton, 10);
}
