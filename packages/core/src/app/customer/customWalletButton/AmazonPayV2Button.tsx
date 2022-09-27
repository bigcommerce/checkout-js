import React, { FunctionComponent } from 'react';

import CheckoutButton, { CheckoutButtonProps } from '../CheckoutButton';

const AmazonPayV2Button: FunctionComponent<CheckoutButtonProps> = (props) => (
    <div className="AmazonPayContainer">
        <CheckoutButton {...props} />
    </div>
);

export default AmazonPayV2Button;
