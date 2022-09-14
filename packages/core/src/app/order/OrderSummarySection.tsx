import React, { FunctionComponent } from 'react';

const OrderSummarySection: FunctionComponent = ({ children }) => (
    <section className="cart-section optimizedCheckout-orderSummary-cartSection">
        {children}
    </section>
);

export default OrderSummarySection;
