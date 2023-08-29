import { render } from '@testing-library/react';
import React from 'react';

import GoogleAutocomplete from './GoogleAutocomplete';

describe('GoogleAutocomplete Component', () => {
    // @todo: add more tests when we can successfully mock "GoogleAutocompleteService"
    // At the moment, jest.mock('...') doesn't seem to do the trick.

    it('renders input with initial value', () => {
        expect(
            render(
                <GoogleAutocomplete
                    apiKey="bar"
                    initialValue="fo"
                    inputProps={{ placeholder: 'NO PO BOX' }}
                />,
            ),
        ).toMatchSnapshot();
    });

    it('renders input with max length', () => {
        expect(
            render(
                <GoogleAutocomplete
                    apiKey="bar"
                    initialValue="fo"
                    inputProps={{ maxLength: "50" }}
                />,
            ),
        ).toMatchSnapshot();
    });
});
