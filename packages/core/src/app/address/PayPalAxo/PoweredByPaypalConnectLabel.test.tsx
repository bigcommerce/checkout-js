import { render, screen } from '@testing-library/react';
import React from 'react';

import PoweredByPaypalConnectLabel from './PoweredByPaypalConnectLabel';

jest.mock('@bigcommerce/checkout/locale', () => ({
    TranslatedString: ({id}: {id: string}) => (<div>{id}</div>),
}));

jest.mock('@bigcommerce/checkout/ui', () => ({
    IconPayPalConnect: () => (<div>IconPayPalConnect</div>),
}));

describe('PoweredByPaypalConnectLabel', () => {
    it('renders povered by paypal connect label', () => {
        render(<PoweredByPaypalConnectLabel />);

        expect(screen.getByText('remote.powered_by')).toBeInTheDocument();
        expect(screen.getByText('IconPayPalConnect')).toBeInTheDocument();
    });
});
