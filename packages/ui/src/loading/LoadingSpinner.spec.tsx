import { shallow } from 'enzyme';
import React from 'react';

import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('shows loading spinner when loading', () => {
        const component = shallow(<LoadingSpinner isLoading={true} />);

        expect(component.exists('.loadingOverlay')).toBe(true);
    });

    it('hides itself when not loading', () => {
        const component = shallow(<LoadingSpinner isLoading={false} />);

        expect(component.html()).toBeNull();
    });
});
