import { Formik, type FormikHelpers as FormikActions, type FormikProps } from 'formik';
import React  from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import connectFormik from './connectFormik';

interface TestProps {
    count: number;
    formik: FormikProps<any>;
}

const TestComponent: React.FC<TestProps> = ({ count, formik }) => (
    <div>
        <span>{count}</span>
        <span>{formik.values.testValue}</span>
    </div>
);

describe('connectFormik', () => {
    let ConnectedTestComponent: React.ComponentType<Omit<TestProps, "formik">>;

    beforeEach(() => {
        ConnectedTestComponent = connectFormik(TestComponent);
    });

    it('should render the wrapped component with formik props', () => {
        render(
            <Formik initialValues={{ testValue: 'test' }} onSubmit={jest.fn()}>
                <ConnectedTestComponent count={1} />
            </Formik>
        );

        expect(screen.getByText('test')).toBeInTheDocument();

    });

    it('should update the wrapped component when formik values change', () => {
        let setFieldValue: FormikActions<{ testValue: string }>['setFieldValue'] = jest.fn();

        render(
            <Formik initialValues={{ testValue: 'initialValue' }} onSubmit={jest.fn()} render={(formik) => {
                setFieldValue = formik.setFieldValue;

                return <ConnectedTestComponent count={1} />;
            }} />
        );

        expect(screen.getByText('initialValue')).toBeInTheDocument();

        setFieldValue('testValue', 'updatedValue');

        expect(screen.getByText('updatedValue')).toBeInTheDocument();
    });

    it('should not re-render the wrapped component if props and formik values are shallowly equal', () => {
        const { rerender } = render(
            <Formik initialValues={{ testValue: 'sameValue' }} onSubmit={jest.fn()}>
                <ConnectedTestComponent count={1} />
            </Formik>
        );

        const initialRender = screen.getByText('sameValue');

        rerender(
            <Formik initialValues={{ testValue: 'sameValue' }} onSubmit={jest.fn()}>
                <ConnectedTestComponent count={1} />
            </Formik>
        );

        const afterRender = screen.getByText('sameValue');

        expect(initialRender).toBe(afterRender);
    });
});
