import React, { type FunctionComponent, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CouponForm, Discounts } from './components';
import { useMultiCoupon } from './useMultiCoupon';

interface MultiCouponProps {
    test?: string;
}

const MultiCoupon: FunctionComponent<MultiCouponProps> = () => {
  const { isCouponCodeCollapsed } = useMultiCoupon();

  const [isCouponFormVisible, setIsCouponFormVisible] = useState(isCouponCodeCollapsed);

  const toggleCouponForm = () => {
    setIsCouponFormVisible((prevState) => !prevState);
  };

  return (
    <>
      <section className="cart-section optimizedCheckout-orderSummary-cartSection">
        <a
          aria-controls="coupon-form-collapsable"
          aria-expanded={isCouponFormVisible}
          className="redeemable-label"
          data-test="redeemable-label"
          href="#"
          onClick={preventDefault(toggleCouponForm)}
        >
          <TranslatedString id="redeemable.toggle_action" />
        </a>
        {isCouponFormVisible && <CouponForm />}
      </section>
      <section className="cart-section optimizedCheckout-orderSummary-cartSection">
        <Discounts />
      </section>
    </>
  );
};

export default MultiCoupon;
