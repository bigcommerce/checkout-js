import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { type IntlTelInputRef } from '@intl-tel-input/react';
import React, { createRef, forwardRef, type FunctionComponent, useImperativeHandle } from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput, { type DynamicInputProps } from './DynamicInput';

const mockIsValidNumber = jest.fn();
const mockSetCountry = jest.fn();

jest.mock('@intl-tel-input/react', () => ({
    __esModule: true,
    default: forwardRef<
        unknown,
        {
            inputProps?: Record<string, unknown>;
            onChangeNumber?: (value: string) => void;
            value?: string;
        }
    >(({ inputProps, onChangeNumber, value }, ref) => {
        useImperativeHandle(ref, () => ({
            getInstance: () => ({
                isValidNumber: mockIsValidNumber,
                setCountry: mockSetCountry,
            }),
        }));

        return (
            <input
                data-test="iti-phone-input"
                {...inputProps}
                onChange={(e) => onChangeNumber?.(e.target.value)}
                value={value ?? ''}
            />
        );
    }),
}));

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
                fieldType={DynamicFormFieldType.DROPDOWN}
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

    describe('when isNewPhoneFieldWithValidation is true', () => {
        beforeEach(() => {
            mockSetCountry.mockClear();
            mockIsValidNumber.mockClear();
        });

        it('renders IntlTelInput instead of a regular tel input', () => {
            render(
                <DynamicInputTest
                    fieldType={DynamicFormFieldType.TELEPHONE}
                    id="field_33"
                    isNewPhoneFieldWithValidation
                    name="phone"
                />,
            );

            expect(screen.getByTestId('iti-phone-input')).toBeInTheDocument();
            expect(screen.queryByRole('textbox')).not.toHaveAttribute('type', 'tel');
        });

        it('auto-sets country via itiRef when selectedCountry is provided and field value is empty', () => {
            const itiRefMock = createRef<IntlTelInputRef>();

            render(
                <DynamicInputTest
                    fieldType={DynamicFormFieldType.TELEPHONE}
                    id="field_33"
                    isNewPhoneFieldWithValidation
                    itiRef={itiRefMock}
                    name="phone"
                    selectedCountry="US"
                />,
            );

            expect(mockSetCountry).toHaveBeenCalledWith('us');
        });

        it('does not auto-set country when a value is already present', () => {
            const itiRefMock = createRef<IntlTelInputRef>();

            render(
                <DynamicInputTest
                    fieldType={DynamicFormFieldType.TELEPHONE}
                    id="field_33"
                    isNewPhoneFieldWithValidation
                    itiRef={itiRefMock}
                    name="phone"
                    selectedCountry="US"
                    value="+15551234567"
                />,
            );

            expect(mockSetCountry).not.toHaveBeenCalled();
        });

        it('does not auto-set country when selectedCountry is not provided', () => {
            const itiRefMock = createRef<IntlTelInputRef>();

            render(
                <DynamicInputTest
                    fieldType={DynamicFormFieldType.TELEPHONE}
                    id="field_33"
                    isNewPhoneFieldWithValidation
                    itiRef={itiRefMock}
                    name="phone"
                />,
            );

            expect(mockSetCountry).not.toHaveBeenCalled();
        });
    });
});
