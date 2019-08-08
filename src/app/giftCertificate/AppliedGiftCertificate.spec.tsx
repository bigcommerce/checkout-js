import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { getGiftCertificate } from './giftCertificate.mock';
import AppliedGiftCertificate from './AppliedGiftCertificate';

describe('AppliedGiftCertificate', () => {
    let component: ShallowWrapper;

    beforeEach(() => {
        component = shallow(<AppliedGiftCertificate giftCertificate={ getGiftCertificate() } />);
    });

    it('renders markup that matches snapshot', () => {
        expect(component).toMatchSnapshot();
    });
});
