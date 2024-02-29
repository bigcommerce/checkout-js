import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import PoweredByPayPalFastlaneLabel from './PoweredByPayPalFastlaneLabel';

jest.mock('@bigcommerce/checkout/locale', () => ({
    TranslatedString: ({ id }: { id: string }) => (<div>{id}</div>),
}));

jest.mock('@bigcommerce/checkout/ui', () => ({
    // TODO: update with PayPal Fastlane icon
    IconPayPalConnect: () => (<div>IconPayPalConnect</div>),
}));

describe('PoweredByPayPalFastlaneLabel', () => {
    it('renders powered by paypal fastlane label', () => {
        render(<PoweredByPayPalFastlaneLabel />);

        expect(screen.getByText('remote.powered_by')).toBeInTheDocument();
        // TODO: update with PayPal Fastlane icon
        expect(screen.getByText('IconPayPalConnect')).toBeInTheDocument();
    });
});
