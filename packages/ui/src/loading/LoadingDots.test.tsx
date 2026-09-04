import { render, screen } from '@testing-library/react';
import React from 'react';

import { LoadingDots } from './LoadingDots';

describe('LoadingDots', () => {
    it('renders three dots hidden from assistive technology', () => {
        const { container } = render(<LoadingDots />);

        expect(screen.getByTestId('loading-dots')).toHaveAttribute('aria-hidden', 'true');
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelectorAll('.loadingDots-dot')).toHaveLength(3);
    });
});
