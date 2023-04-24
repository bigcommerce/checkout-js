import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';

import { createLocaleContext, LocaleContext, LocaleContextType, WithDateProps } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import CheckboxInput from './CheckboxInput';
import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput, { DynamicInputProps } from './DynamicInput';
import RadioInput from './RadioInput';
import TextArea from './TextArea';
import TextInput from './TextInput';

describe('DynamicInput', () => {
    let localeContext: Required<LocaleContextType>;
    let date: Required<LocaleContextType>['date'];
    let DynamicInputTest: FunctionComponent<DynamicInputProps & WithDateProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        date = localeContext.date;

        DynamicInputTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <DynamicInput {...props} />
            </LocaleContext.Provider>
        );
    });

    it('renders text input for default input with passed props', () => {
        expect(
            mount(<DynamicInputTest date={date} id="field_33" name="x" />).html(),
        ).toMatchSnapshot();
    });

    it('renders textarea for multiline type', () => {
        expect(
            mount(
                <DynamicInputTest
                    date={date}
                    fieldType={DynamicFormFieldType.multiline}
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
                date={date}
                fieldType={DynamicFormFieldType.date}
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

    it('renders checkbox input for checkbox type', () => {
        const component = mount(
            <DynamicInputTest
                date={date}
                fieldType={DynamicFormFieldType.checkbox}
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
                date={date}
                fieldType={DynamicFormFieldType.radio}
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
            mount(
                <DynamicInputTest
                    date={date}
                    fieldType={DynamicFormFieldType.number}
                    id="field_33"
                />,
            )
                .find(TextInput)
                .prop('type'),
        ).toBe('number');
    });

    it('renders password type input for password type', () => {
        expect(
            mount(
                <DynamicInputTest
                    date={date}
                    fieldType={DynamicFormFieldType.password}
                    id="field_33"
                />,
            )
                .find(TextInput)
                .prop('type'),
        ).toBe('password');
    });

    it('renders tel type input for phone type', () => {
        expect(
            mount(
                <DynamicInputTest
                    date={date}
                    fieldType={DynamicFormFieldType.telephone}
                    id="field_33"
                />,
            )
                .find(TextInput)
                .prop('type'),
        ).toBe('tel');
    });

    it('renders select input with passed props', () => {
        expect(
            mount(
                <DynamicInputTest
                    date={date}
                    defaultValue="foo"
                    fieldType={DynamicFormFieldType.dropdown}
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
