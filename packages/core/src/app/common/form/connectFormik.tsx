import { connect } from 'formik';
import React, { ComponentType, FunctionComponent, memo } from 'react';
import shallowEqual from 'shallowequal';

import ConnectFormikProps from './ConnectFormikProps';

export default function connectFormik<TProps extends ConnectFormikProps<TValues>, TValues = any>(
    OriginalComponent: ComponentType<TProps>,
): ComponentType<Omit<TProps, keyof ConnectFormikProps<TValues>>> {
    const InnerComponent: FunctionComponent<TProps> = memo(
        (props) => <OriginalComponent {...props} />,
        ({ formik: prevFormik, ...prevProps }, { formik: nextFormik, ...nextProps }) =>
            shallowEqual(prevFormik, nextFormik) && shallowEqual(prevProps, nextProps),
    );

    const DecoratedComponent = connect<TProps, TValues>(InnerComponent) as ComponentType<
        Omit<TProps, keyof ConnectFormikProps<TValues>>
    >;

    DecoratedComponent.displayName = `ConnectFormik(${
        OriginalComponent.displayName || OriginalComponent.name
    })`;

    return DecoratedComponent;
}
