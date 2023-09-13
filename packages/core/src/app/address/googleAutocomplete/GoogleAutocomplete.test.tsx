import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FunctionComponent } from 'react';

import GoogleAutocomplete, { GoogleAutocompleteProps } from './GoogleAutocomplete';

describe('GoogleAutocomplete Component', () => {
    let ComponentTest: FunctionComponent<GoogleAutocompleteProps>;
    let defaultProps: GoogleAutocompleteProps;

    beforeAll(() => {
        defaultProps = {
            apiKey: 'bar',
            initialValue: 'fo',
        };
        ComponentTest = (props) => <GoogleAutocomplete {...props} />;
    });

    it('renders input with initial value and placeholder text', () => {
        render(<ComponentTest {...defaultProps} inputProps={{ placeholder: 'NO PO BOX' }} />);
        expect(screen.getByPlaceholderText('NO PO BOX')).toBeInTheDocument();
    });

    it('renders input and limits value to max length', async () => {
        render(
            <ComponentTest
                {...defaultProps}
                initialValue=""
                inputProps={{ placeholder: 'Max length 50', maxLength: '50' }}
            />,
        );
        expect(screen.getByPlaceholderText('Max length 50')).toBeInTheDocument();
        await userEvent.type(
            screen.getByPlaceholderText('Max length 50'),
            '120 South Jean Baptiste Point du Sable Lake Shore Drive',
        );

        const inputElement: HTMLInputElement = screen.getByPlaceholderText('Max length 50');

        expect(inputElement.value).toBe('120 South Jean Baptiste Point du Sable Lake Shore ');
    });
});
