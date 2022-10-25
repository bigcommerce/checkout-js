import { shallow } from 'enzyme';
import React from 'react';

import LoadingNotification from './LoadingNotification';

describe('LoadingNotification', () => {
    it('renders markup that matches snapshot', () => {
        const component = shallow(<LoadingNotification isLoading={true} />);

        expect(component).toMatchSnapshot();
    });

    it('shows loading spinner when loading', () => {
        const component = shallow(<LoadingNotification isLoading={true} />);

        expect(component.exists('.loadingNotification')).toBe(true);
    });

    it('hides loading spinner when not loading', () => {
        const component = shallow(<LoadingNotification isLoading={false} />);

        expect(component.exists('.loadingNotification')).toBe(false);
    });
});
