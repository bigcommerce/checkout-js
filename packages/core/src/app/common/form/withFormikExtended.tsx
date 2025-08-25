import {
    type FormikProps,
    type FormikValues,
    withFormik,
    type WithFormikConfig,
} from 'formik';
import React, {
    type ComponentType,
    useEffect,
    useRef,
} from 'react';

export interface WithFormikExtendedProps {
    isInitialValueLoaded?: boolean;
}

/**
 * This HOC extends the behavior of the default `withFormik` HOC. It can reset a form to its initial state when
 * the `isInitialValueLoaded` prop is set to true. This is useful when a form needs to be rendered before its
 * initial value is fully loaded.
 */
export default function withFormikExtended<
    TOuterProps extends object,
    TValues extends FormikValues = FormikValues,
    TPayload = TValues
>(
    config: WithFormikConfig<TOuterProps, TValues, TPayload>
) {
    return (
        OriginalComponent: ComponentType<TOuterProps & FormikProps<TValues>>
    ) => {
        const DecoratedComponent: ComponentType<
            TOuterProps & FormikProps<TValues> & WithFormikExtendedProps
        > = (props) => {
            const { resetForm, isInitialValueLoaded, initialValues } = props;
            const previousIsInitialValueLoadedRef = useRef(isInitialValueLoaded);

            useEffect(() => {
                if (
                    previousIsInitialValueLoadedRef.current === false &&
                    isInitialValueLoaded === true
                ) {
                    resetForm({ values: initialValues ?? {} });
                }

                previousIsInitialValueLoadedRef.current = isInitialValueLoaded;
            }, [isInitialValueLoaded, initialValues, resetForm]);

            return <OriginalComponent {...props} />;
        };

        DecoratedComponent.displayName = `WithFormikExtended(${
            OriginalComponent.displayName || OriginalComponent.name
        })`;

        return withFormik(config)(DecoratedComponent);
    };
}
