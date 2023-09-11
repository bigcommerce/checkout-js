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

    if (container) {
        container.style.width = '100%';
        return;
    }

    setTimeout(beautifyAmazonButton, 10);
}
