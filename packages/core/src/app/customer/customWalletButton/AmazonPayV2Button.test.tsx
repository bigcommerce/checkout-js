/* eslint-disable testing-library/no-container */
import { noop } from 'lodash';
import React from 'react';

import { render} from '@bigcommerce/checkout/test-utils';

import AmazonPayV2Button from './AmazonPayV2Button';

jest.useFakeTimers();
describe('AmazonPayV2Button', () => {
    it('renders as CheckoutButton', () => {
       const {container} = render(
            <AmazonPayV2Button
                containerId="test"
                deinitialize={noop}
                initialize={noop}
                methodId="amazonpay"
                onError={noop}
            />,
        );

        expect(container.querySelector('.AmazonPayContainer')).toBeInTheDocument();
        expect(container.querySelector('#test')).toBeInTheDocument();
    });

    it('should apply height to button after beautifyAButton runs', async () => {
      const { container } = render(
          <AmazonPayV2Button
            containerId="test"
            deinitialize={noop}
            initialize={noop}
            methodId="amazonpay"
            onError={noop}
          />
        );

        jest.runAllTimers();
    
        const buttonContainer = container.querySelector('#test');

        expect(buttonContainer).toBeInTheDocument()

        if (!container.querySelector('.checkout-button-container')) {
            return;
        }

        if (buttonContainer) {
            expect(buttonContainer).toHaveStyle('height: 36px');
        } else {
            throw new Error('button not found')
        }
      });
});
