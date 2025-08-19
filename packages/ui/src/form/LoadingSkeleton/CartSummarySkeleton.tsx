import React, { type FunctionComponent } from 'react';

export const CartSummarySkeleton: FunctionComponent = () => (
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
);
