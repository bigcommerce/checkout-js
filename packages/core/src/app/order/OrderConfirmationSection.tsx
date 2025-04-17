import React, { FunctionComponent } from 'react';

const OrderConfirmationSection: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => (
    <section className="orderConfirmation-section">{children}</section>
);

export default OrderConfirmationSection;
