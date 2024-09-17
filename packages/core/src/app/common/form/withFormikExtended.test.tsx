import userEvent from '@testing-library/user-event';
import React, { ComponentType } from 'react';
import { object, string } from 'yup';

import { render, screen } from '@bigcommerce/checkout/test-utils';
import { Button, Input, Label } from '@bigcommerce/checkout/ui';

import { Form } from '../../ui/form';

import withFormikExtended from './withFormikExtended';

describe('withFormikExtended', () => {
    interface TestComponentProps {
        defaultTitle?: string;
        isInitialValueLoaded?: boolean;
        submit(values: TestComponentValues): void;
    }

    interface TestComponentValues {
        title?: string;
    }

    const TestComponent: ComponentType<TestComponentProps> = () => (
        <Form>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" type="text" />
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
        isInitialValid({ defaultTitle }) {
            return !!defaultTitle;
        },
        validationSchema: object({
            title: string().required(),
        }),
    })(TestComponent);

    it('resets form after initital value is loaded', async () => {
        const submit = jest.fn();
        const { rerender } = render(<DecoratedTestComponent isInitialValueLoaded={false} submit={ submit } />);

        await userEvent.click(screen.getByText('Submit'));

        // The initial value is invalid at this point therefore the submit function should not called
        expect(submit).not.toHaveBeenCalled();

        rerender(<DecoratedTestComponent defaultTitle="Hello" isInitialValueLoaded={true} submit={ submit } />);

        await userEvent.click(screen.getByText('Submit'));

        // The initial value is now valid therefore the submit function should be called
        expect(submit).toHaveBeenCalled();
    });
});
