import { render } from 'enzyme';
import React from 'react';

import PoweredByPaypalConnectLabel from './PoweredByPaypalConnectLabel';

describe('PoweredByPaypalConnectLabel', () => {
    it('renders PayPal Connect label', () => {
        const label = render(<PoweredByPaypalConnectLabel />);

        expect(label).toMatchSnapshot();
    });
});
