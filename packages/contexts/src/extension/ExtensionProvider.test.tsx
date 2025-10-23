import { render, screen } from '@testing-library/react';
import React from 'react';

import { ExtensionProvider } from './ExtensionProvider';
import { type ExtensionServiceInterface } from './ExtensionType';

describe('ExtensionProvider', () => {
    it('renders the children', () => {
        const extensionService: ExtensionServiceInterface = {
            setDispatch: jest.fn(),
            loadExtensions: jest.fn(),
            preloadExtensions: jest.fn(),
            renderExtension: jest.fn(),
            removeListeners: jest.fn(),
            isRegionEnabled: jest.fn(),
        };

        render(
            <ExtensionProvider extensionService={extensionService}>
                <div data-test="child-component">Child Component</div>
            </ExtensionProvider>,
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });
});
