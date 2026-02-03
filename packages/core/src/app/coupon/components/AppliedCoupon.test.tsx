import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCoupon } from '../utils/coupons.mock';

import AppliedCoupon from './AppliedCoupon';

describe('AppliedCoupon', () => {
  it('renders applied coupon', () => {
    render(<AppliedCoupon coupon={getCoupon()} />);

    expect(screen.getByText('20% off each item')).toBeInTheDocument();
    expect(screen.getByText('savebig2015')).toBeInTheDocument();
  });
});
