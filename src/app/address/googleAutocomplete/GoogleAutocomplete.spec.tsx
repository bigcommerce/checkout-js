import { render } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';

import GoogleAutocomplete from './GoogleAutocomplete';

describe('GoogleAutocomplete Component', () => {
    // @todo: add more tests when we can successfully mock "GoogleAutocompleteService"
    // At the moment, jest.mock('...') doesn't seem to do the trick.

    it('renders input with initial value', () => {
        const tree = render(<GoogleAutocomplete apiKey="bar" initialValue="fo" />);

        expect(toJson(tree)).toMatchSnapshot();
    });
});
