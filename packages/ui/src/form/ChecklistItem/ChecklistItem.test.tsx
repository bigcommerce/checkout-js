import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import AccordionContext from '../../accordion/AccordionContext';
import { ChecklistContext } from '../Checklist/Checklist';

import ChecklistItem from './ChecklistItem';

jest.mock('react-transition-group', () => ({
    CSSTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderChecklistItem = (props = {}) =>
    render(
        <Formik initialValues={{ payment: '' }} onSubmit={noop}>
            <ChecklistContext.Provider value={{ name: 'payment' }}>
                <AccordionContext.Provider value={{ onToggle: noop, selectedItemId: undefined }}>
                    <ChecklistItem label="Pay by card" value="card" {...props} />
                </AccordionContext.Provider>
            </ChecklistContext.Provider>
        </Formik>,
    );

describe('ChecklistItem', () => {
    it('renders the label', () => {
        renderChecklistItem();

        expect(screen.getByText('Pay by card')).toBeInTheDocument();
    });

    it('renders a disabled radio input when isDisabled is true', () => {
        renderChecklistItem({ isDisabled: true });

        expect(screen.getByRole('radio')).toBeDisabled();
    });

    it('keeps the radio input focusable but ignores selection when isReadOnly is true', () => {
        renderChecklistItem({ isReadOnly: true });

        const radio = screen.getByRole('radio');

        expect(radio).toBeEnabled();
        expect(radio).toHaveAttribute('aria-disabled', 'true');
        expect(radio).not.toBeChecked();

        fireEvent.click(radio);

        expect(radio).not.toBeChecked();
    });
});
