import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';

import { LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { CheckboxInput } from '../CheckboxInput';
import { RadioInput } from '../RadioInput';
import { TextArea } from '../TextArea';
import { TextInput } from '../TextInput';

import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput, { DynamicInputProps } from './DynamicInput';

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
        expect(mount(<DynamicInputTest id="field_33" name="x" />).html()).toMatchSnapshot();
    });

    it('renders textarea for multiline type', () => {
        expect(
            mount(
                <DynamicInputTest
                    fieldType={DynamicFormFieldType.MULTILINE}
                    id="field_33"
                    rows={4}
                />,
            )
                .find(TextArea)
                .prop('rows'),
        ).toBe(4);
    });

    it('renders date picker for date type', () => {
        const datePicker = mount(
            <DynamicInputTest
                fieldType={DynamicFormFieldType.DATE}
                id="field_33"
                max="2019-02-01"
                min="2019-01-01"
            />,
        );

        expect(datePicker.find(ReactDatePicker).props()).toMatchObject(
            expect.objectContaining({
                minDate: new Date('2019-01-01T00:00:00Z'),
                maxDate: new Date('2019-02-01T00:00:00Z'),
            }),
        );
    });

    it('renders date picker for date type with inputDateFormat prop', () => {
        const datePicker = mount(
            <DynamicInputTest
                fieldType={DynamicFormFieldType.DATE}
                id="field_33"
                inputDateFormat="dd.MM.yyyy"
                max="2019-02-01"
                min="2019-01-01"
            />,
        );

        expect(datePicker.find(ReactDatePicker).props()).toMatchObject(
            expect.objectContaining({
                dateFormat: 'dd.MM.yyyy',
                placeholderText: 'DD.MM.YYYY',
            }),
        );
    });

    it('renders checkbox input for checkbox type', () => {
        const component = mount(
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

        expect(component.find(CheckboxInput).at(0).props()).toEqual(
            expect.objectContaining({
                id: 'id-x',
                checked: false,
            }),
        );

        expect(component.find(CheckboxInput).at(1).props()).toEqual(
            expect.objectContaining({
                id: 'id-y',
                checked: true,
            }),
        );
    });

    it('renders radio type input for radio type', () => {
        const component = mount(
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

        expect(component.find(RadioInput).at(0).props()).toEqual(
            expect.objectContaining({
                id: 'id-x',
                checked: false,
            }),
        );

        expect(component.find(RadioInput).at(1).props()).toEqual(
            expect.objectContaining({
                id: 'id-y',
                checked: true,
            }),
        );
    });

    it('renders number type input for number type', () => {
        expect(
            mount(<DynamicInputTest fieldType={DynamicFormFieldType.NUMBER} id="field_33" />)
                .find(TextInput)
                .prop('type'),
        ).toBe('number');
    });

    it('renders password type input for password type', () => {
        expect(
            mount(<DynamicInputTest fieldType={DynamicFormFieldType.PASSWORD} id="field_33" />)
                .find(TextInput)
                .prop('type'),
        ).toBe('password');
    });

    it('renders tel type input for phone type', () => {
        expect(
            mount(<DynamicInputTest fieldType={DynamicFormFieldType.TELEPHONE} id="field_33" />)
                .find(TextInput)
                .prop('type'),
        ).toBe('tel');
    });

    it('renders select input with passed props', () => {
        expect(
            mount(
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
            ).html(),
        ).toMatchSnapshot();
    });
});
