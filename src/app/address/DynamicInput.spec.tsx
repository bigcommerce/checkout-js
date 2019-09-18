import { shallow } from 'enzyme';
import React from 'react';
import ReactDatePicker from 'react-datepicker';

import { CheckboxInput, RadioInput, TextArea, TextInput } from '../ui/form';

import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';

describe('DynamicInput', () => {
    it('renders text input for default input with passed props', () => {
        expect(shallow(<DynamicInput id="field_33" name="x" />).html())
            .toMatchSnapshot();
    });

    it('renders textarea for multiline type', () => {
        expect(shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.multiline }
                id="field_33"
                rows={ 4 }
            />)
            .find(TextArea)
            .prop('rows'))
            .toEqual(4);
    });

    it('renders date picker for date type', () => {
        const datePicker = shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.date }
                id="field_33"
                max="2019-2-1"
                min="2019-1-1"
            />
        );

        expect(datePicker.find(ReactDatePicker).props())
            .toMatchObject(expect.objectContaining({
                minDate: new Date('2019-01-01 00:00:00'),
                maxDate: new Date('2019-02-01 00:00:00'),
            }));
    });

    it('renders checkbox input for checkbox type', () => {
        const component = shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.checkbox }
                id="id"
                options={ [
                    { value: 'x', label: 'X' },
                    { value: 'y', label: 'Y' },
                ] }
                value={ ['y'] }
            />);

        expect(component.find(CheckboxInput).at(0).props())
            .toEqual(expect.objectContaining({
                id: 'id-x',
                checked: false,
            }));

        expect(component.find(CheckboxInput).at(1).props())
            .toEqual(expect.objectContaining({
                id: 'id-y',
                checked: true,
            }));
    });

    it('renders radio type input for radio type', () => {
        const component = shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.radio }
                id="id"
                onChange={ jest.fn() }
                options={ [
                    { value: 'x', label: 'X' },
                    { value: 'y', label: 'Y' },
                ] }
                value="y"
            />);

        expect(component.find(RadioInput).at(0).props())
            .toEqual(expect.objectContaining({
                id: 'id-x',
                checked: false,
            }));

        expect(component.find(RadioInput).at(1).props())
            .toEqual(expect.objectContaining({
                id: 'id-y',
                checked: true,
            }));
    });

    it('renders number type input for number type', () => {
        expect(shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.number }
                id="field_33"
            />)
            .find(TextInput)
            .prop('type'))
            .toEqual('number');
    });

    it('renders password type input for password type', () => {
        expect(shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.password }
                id="field_33"
            />)
            .find(TextInput)
            .prop('type'))
            .toEqual('password');
    });

    it('renders tel type input for phone type', () => {
        expect(shallow(
            <DynamicInput
                fieldType={ DynamicFormFieldType.telephone }
                id="field_33"
            />)
            .find(TextInput)
            .prop('type'))
            .toEqual('tel');
    });

    it('renders select input with passed props', () => {
        expect(shallow(
            <DynamicInput
                defaultValue="foo"
                fieldType={ DynamicFormFieldType.dropdown }
                id="field_33"
                name="select"
                options={ [
                    { label: 'Foo', value: 'foo'},
                    { label: 'Foo1', value: 'foo1'},
                ] }
                placeholder="Select an option"
            />).html())
            .toMatchSnapshot();
    });
});
