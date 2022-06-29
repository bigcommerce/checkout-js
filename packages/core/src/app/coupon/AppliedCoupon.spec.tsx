import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { getCoupon } from './coupons.mock';
import AppliedCoupon from './AppliedCoupon';

describe('AppliedCoupon', () => {
    let component: ShallowWrapper;

    beforeEach(() => {
        component = shallow(<AppliedCoupon coupon={ getCoupon() } />);
    });

    it('renders markup that matches snapshot', () => {
        expect(component).toMatchSnapshot();
    });
});
