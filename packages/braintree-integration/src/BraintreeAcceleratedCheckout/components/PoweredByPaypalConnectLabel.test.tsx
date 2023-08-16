import { render } from '@testing-library/react';
import React from 'react';

import PoweredByPaypalConnectLabel from './PoweredByPaypalConnectLabel';

describe('PoweredByPaypalConnectLabel', () => {
    it('renders PayPal Connect label', () => {
        const view = render(<PoweredByPaypalConnectLabel />);

        expect(view).toMatchSnapshot();
    });
});
