import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { isEmbedded } from '../../utils';

const OrderConfirmationPageSkeleton: FunctionComponent = () => (
    <div
        className={classNames('layout optimizedCheckout-contentPrimary', {
            'is-embedded': isEmbedded(),
        })}
    >
        <div className="layout-main">
            <div className="order-confirmation-page-skeleton">
                <div className="thankyou" />
                <div className="line-1" />
                <div className="line-2" />
                <div className="continue" />
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

export default OrderConfirmationPageSkeleton;
