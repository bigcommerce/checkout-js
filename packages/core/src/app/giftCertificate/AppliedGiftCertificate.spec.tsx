import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import AppliedGiftCertificate from './AppliedGiftCertificate';
import { getGiftCertificate } from './giftCertificate.mock';

describe('AppliedGiftCertificate', () => {
    let component: ShallowWrapper;

    beforeEach(() => {
        component = shallow(<AppliedGiftCertificate giftCertificate={getGiftCertificate()} />);
    });

    it('renders markup that matches snapshot', () => {
        expect(component).toMatchSnapshot();
    });
});
