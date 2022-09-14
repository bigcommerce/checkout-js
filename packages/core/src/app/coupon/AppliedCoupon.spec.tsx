import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import AppliedCoupon from './AppliedCoupon';
import { getCoupon } from './coupons.mock';

describe('AppliedCoupon', () => {
    let component: ShallowWrapper;

    beforeEach(() => {
        component = shallow(<AppliedCoupon coupon={getCoupon()} />);
    });

    it('renders markup that matches snapshot', () => {
        expect(component).toMatchSnapshot();
    });
});
