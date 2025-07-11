import React, { FunctionComponent } from 'react';

const CheckoutPageSkeleton: FunctionComponent = () => (
    <div style={{ width: '100%' }}>
        <div className="layout-main">
            <div className="checkout-steps checkout-page-skeleton">
                <div className="title--first" />
                <div className="textbox" />
                <div className="subscription">
                    <div className="checkbox" />
                    <div className="description" />
                </div>
                <div className="terms--1" />
                <div className="terms--2" />
                <div className="title" />
                <div className="title" />
                <div className="title" />
            </div>
        </div>
        <aside className="layout-cart">
            <article className="cart optimizedCheckout-orderSummary checkout-page-skeleton checkout-page-skeleton--cart">
                <div className="item--first">
                    <div />
                    <div />
                </div>
                <div className="item">
                    <div />
                </div>
                <div className="item--product">
                    <div className="figure" />
                    <div className="name" />
                    <div />
                </div>
                <div className="item">
                    <div />
                    <div />
                </div>
                <div className="item">
                    <div />
                    <div />
                </div>
                <div className="item--coupon">
                    <div />
                </div>
                <div className="item--total">
                    <div />
                    <div />
                </div>
                <div className="item--tax">
                    <div />
                </div>
                <div className="item--last">
                    <div />
                    <div />
                </div>
            </article>
        </aside>
    </div>
);

export default CheckoutPageSkeleton;
