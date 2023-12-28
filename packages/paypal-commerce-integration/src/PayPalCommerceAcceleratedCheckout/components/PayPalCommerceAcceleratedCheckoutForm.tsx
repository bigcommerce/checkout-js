import React, { FunctionComponent } from 'react';

import { PayPalConnectCardComponentRef } from '../PayPalCommerceAcceleratedCheckoutPaymentMethod';

import PayPalCommerceAcceleratedCheckoutCreditCardForm from './PayPalCommerceAcceleratedCheckoutCreditCardForm';

interface PayPalCommerceAcceleratedCheckoutFormProps {
    renderPayPalConnectCardComponent?: PayPalConnectCardComponentRef['render'];
}

const PayPalCommerceAcceleratedCheckoutForm: FunctionComponent<
    PayPalCommerceAcceleratedCheckoutFormProps
> = ({ renderPayPalConnectCardComponent }) => {
    // Hook might be here

    return (
        <div className="paymentMethod paymentMethod--creditCard">
            {/* Add vaulted element here */}

            <PayPalCommerceAcceleratedCheckoutCreditCardForm
                renderPayPalConnectCardComponent={renderPayPalConnectCardComponent}
            />
        </div>
    );
};

export default PayPalCommerceAcceleratedCheckoutForm;
