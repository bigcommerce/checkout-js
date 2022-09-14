import { mount } from 'enzyme';
import { Field, Formik, FormikActions } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import connectFormik from './connectFormik';
import ConnectFormikProps from './ConnectFormikProps';

describe('connectFormik()', () => {
    it('only re-renders connected component if Formik props have changed', () => {
        const TestComponent: FunctionComponent = jest.fn(() => <div />);
        const ConnectedTestComponent = connectFormik(TestComponent);
        let setFieldValue: FormikActions<{ message: string }>['setFieldValue'] = noop;

        mount(
            <Formik
                initialValues={{ message: 'foobar' }}
                onSubmit={jest.fn()}
                render={(formik) => {
                    setFieldValue = formik.setFieldValue;

                    return (
                        <>
                            <ConnectedTestComponent />
                            <Field name="message" />
                        </>
                    );
                }}
            />,
        );

        expect(TestComponent).toHaveBeenCalledTimes(1);

        // Setting the same value as the initial value
        setFieldValue('message', 'foobar');

        expect(TestComponent).toHaveBeenCalledTimes(1);

        // Setting a value different to the initial value
        setFieldValue('message', 'hello');

        expect(TestComponent).toHaveBeenCalledTimes(2);
    });

    it('also re-renders connected component if non-Formik props have changed', () => {
        const TestComponent: FunctionComponent<
            { count: number } & ConnectFormikProps<{ message: string }>
        > = jest.fn(() => <div />);
        const ConnectedTestComponent = connectFormik(TestComponent);
        const initialValues = { message: 'foobar' };
        const handleSubmit = jest.fn();
        const Container: FunctionComponent<{ count: number }> = (props) => (
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                render={() => {
                    return (
                        <>
                            <ConnectedTestComponent {...props} />
                            <Field name="message" />
                        </>
                    );
                }}
            />
        );

        const container = mount(<Container count={1} />);

        expect(TestComponent).toHaveBeenCalledTimes(1);

        // Changing the value of `count`, which is passed to
        // `ConnectedTestComponent`, should re-render that component.
        container.setProps({ count: 2 });

        expect(TestComponent).toHaveBeenCalledTimes(2);
    });
});
