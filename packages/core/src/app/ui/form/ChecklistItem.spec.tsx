import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { AccordionItem } from '../accordion';

import Checklist from './Checklist';
import ChecklistItem from './ChecklistItem';

describe('ChecklistItem', () => {
    it('sets the expected class names', () => {
        const component = mount(
            <Formik
                initialValues={{ option: 'foo' }}
                onSubmit={noop}
                render={() => (
                    <Checklist name="option">
                        <ChecklistItem label="Foo label" value="foo" />
                    </Checklist>
                )}
            />,
        );

        expect(component.find(AccordionItem).props()).toEqual(
            expect.objectContaining({
                bodyClassName: 'form-checklist-body',
                className: 'form-checklist-item optimizedCheckout-form-checklist-item',
                classNameSelected:
                    'form-checklist-item--selected optimizedCheckout-form-checklist-item--selected',
            }),
        );
    });

    it('can be disabled', () => {
        const component = mount(
            <Formik
                initialValues={{ option: 'foo' }}
                onSubmit={noop}
                render={() => (
                    <Checklist name="option">
                        <ChecklistItem isDisabled label="Foo label" value="foo" />
                    </Checklist>
                )}
            />,
        );

        expect(component.find('input').prop('disabled')).toBe(true);
    });
});
