import { createLanguageService } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput, { type DynamicInputProps } from './DynamicInput';

describe('DynamicInput', () => {
    let localeContext: LocaleContextType;
    let DynamicInputTest: FunctionComponent<DynamicInputProps>;

    beforeEach(() => {
        localeContext = {
            date: {
                inputFormat: 'dd/MM/yyyy',
            },
            language: createLanguageService(),
        };

        DynamicInputTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <DynamicInput {...props} />
            </LocaleContext.Provider>
        );
    });

    it('renders text input for default input with passed props', () => {
        render(<DynamicInputTest id="field_33" name="x" />);

        expect(screen.getByRole('textbox')).toHaveAttribute('name', 'x');
        expect(screen.getByRole('textbox')).toHaveAttribute('id', 'field_33');
    });

    it('renders textarea for multiline type', () => {
        render(
            <DynamicInputTest fieldType={DynamicFormFieldType.MULTILINE} id="field_33" rows={4} />,
        );

        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'multiline');
        expect(screen.getByRole('textbox')).toHaveAttribute('id', 'field_33');
        expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
    });

    it('renders date picker for date type', async () => {
        const { container } = render(
            <DynamicInputTest
                fieldType={DynamicFormFieldType.DATE}
                id="field_33"
                max="2019-02-01"
                min="2019-01-01"
            />,
        );

        await waitFor(() => {
            // eslint-disable-next-line testing-library/no-container
            expect(container.querySelector('.react-datepicker-wrapper')).toBeInTheDocument();
        });

        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'DD/MM/YYYY');
    });

    it('renders date picker for date type with inputDateFormat prop', async () => {
        const { container } = render(
            <DynamicInputTest
                fieldType={DynamicFormFieldType.DATE}
                id="field_33"
                inputDateFormat="dd.MM.yyyy"
                max="2019-02-01"
                min="2019-01-01"
            />,
        );

        await waitFor(() => {
            // eslint-disable-next-line testing-library/no-container
            expect(container.querySelector('.react-datepicker-wrapper')).toBeInTheDocument();
        });

        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
        expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'DD.MM.YYYY');
    });

    it('renders checkbox input for checkbox type', () => {
        render(
            <DynamicInputTest
                fieldType={DynamicFormFieldType.CHECKBOX}
                id="id"
                options={[
                    { value: 'x', label: 'X' },
                    { value: 'y', label: 'Y' },
                ]}
                value={['y']}
            />,
        );

        expect(screen.getAllByRole('checkbox')).toHaveLength(2);
        expect(screen.getByLabelText('X')).not.toBeChecked();
        expect(screen.getByLabelText('Y')).toBeChecked();
    });

    it('renders radio type input for radio type', () => {
        render(
            <DynamicInputTest
                fieldType={DynamicFormFieldType.RADIO}
                id="id"
                onChange={jest.fn()}
                options={[
                    { value: 'x', label: 'X' },
                    { value: 'y', label: 'Y' },
                ]}
                value="y"
            />,
        );

        expect(screen.getAllByRole('radio')).toHaveLength(2);
        expect(screen.getByLabelText('X')).not.toBeChecked();
        expect(screen.getByLabelText('Y')).toBeChecked();
    });

    it('renders number type input for number type', () => {
        render(<DynamicInputTest fieldType={DynamicFormFieldType.NUMBER} id="field_33" />);

        expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });

    it('renders password type input for password type', () => {
        render(<DynamicInputTest fieldType={DynamicFormFieldType.PASSWORD} id="field_33" />);

        expect(screen.getByTestId('field_33-password')).toHaveAttribute('type', 'password');
    });

    it('renders tel type input for phone type', () => {
        render(<DynamicInputTest fieldType={DynamicFormFieldType.TELEPHONE} id="field_33" />);

        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
    });

    it('renders select input with passed props', () => {
        render(
            <DynamicInputTest
                defaultValue="foo"
                fieldType={DynamicFormFieldType.DROPDOWM}
                id="field_33"
                name="select"
                options={[
                    { label: 'Foo', value: 'foo' },
                    { label: 'Foo1', value: 'foo1' },
                ]}
                placeholder="Select an option"
            />,
        );

        expect(screen.getByRole('combobox')).toHaveAttribute('name', 'select');
        expect(screen.getByText('Foo')).toBeInTheDocument();
        expect(screen.getByText('Foo1')).toBeInTheDocument();
    });
});
