import React, { type FunctionComponent } from 'react';

const OrderSummarySection: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => (
    <section className="cart-section optimizedCheckout-orderSummary-cartSection">
        {children}
    </section>
);

export default OrderSummarySection;
