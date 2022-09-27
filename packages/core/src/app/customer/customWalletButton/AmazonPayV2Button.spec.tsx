import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import CheckoutButton from '../CheckoutButton';

import AmazonPayV2Button from './AmazonPayV2Button';

describe('AmazonPayV2Button', () => {
    it('renders as CheckoutButton', () => {
        const container = shallow(
            <AmazonPayV2Button
                containerId="test"
                deinitialize={noop}
                initialize={noop}
                methodId="amazonpay"
                onError={noop}
            />,
        );

        expect(container.hasClass('AmazonPayContainer')).toBe(true);
        expect(container.find(CheckoutButton)).toHaveLength(1);
    });
});
