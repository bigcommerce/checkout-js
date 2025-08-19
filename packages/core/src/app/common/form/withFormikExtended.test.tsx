import userEvent from '@testing-library/user-event';
import { ErrorMessage } from 'formik';
import React, { act, type ComponentType } from 'react';
import { object, string } from 'yup';

import { render, screen } from '@bigcommerce/checkout/test-utils';
import { Button, Input, Label } from '@bigcommerce/checkout/ui';

import { Form } from '../../ui/form';

import withFormikExtended from './withFormikExtended';

describe('withFormikExtended', () => {
    interface TestComponentProps {
        defaultTitle?: string;
        submit(values: TestComponentValues): void;
    }

    interface TestComponentValues {
        title?: string;
    }

    const TestComponent: ComponentType<TestComponentProps> = () => (
        <Form>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" type="text" />
            <ErrorMessage component="div" name="title" />
            <Button type="submit">Submit</Button>
        </Form>
    );

    const DecoratedTestComponent = withFormikExtended<TestComponentProps, TestComponentValues>({
        handleSubmit(values, { props: { submit } }) {
            submit(values);
        },
        mapPropsToValues({ defaultTitle }) {
            return { title: defaultTitle };
        },
        enableReinitialize: true,
        validationSchema: object({
            title: string().required(),
        }),
    })(TestComponent);

    it('resets form after initital value is loaded', async () => {
        const submit = jest.fn();
        const { rerender } = render(<DecoratedTestComponent submit={submit} />);

        await act(async () => {
            await userEvent.click(screen.getByText('Submit'));
        });

        expect(screen.getByText('title is a required field')).toBeInTheDocument();
        expect(submit).not.toHaveBeenCalled();

        await act(async () => {
            rerender(<DecoratedTestComponent defaultTitle="Hello" submit={submit} />);

            await userEvent.click(screen.getByText('Submit'));
        });

        expect(screen.queryByText('title is a required field')).not.toBeInTheDocument();
        expect(submit).toHaveBeenCalled();
    });
});
