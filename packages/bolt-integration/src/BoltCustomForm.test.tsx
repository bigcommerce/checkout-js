import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';

import BoltCustomForm, { type BoltCustomFormProps } from './BoltCustomForm';

describe('BoltCustomForm', () => {
    let defaultProps: BoltCustomFormProps;
    let BoltCustomFormTest: FunctionComponent<BoltCustomFormProps>;

    beforeEach(() => {
        defaultProps = {
            containerId: 'boltEmbeddedOneClick',
            showCreateAccountCheckbox: false,
        };

        const checkoutService = createCheckoutService();

        BoltCustomFormTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <BoltCustomForm {...props} />
            </LocaleProvider>
        );
    });

    it('renders bolt embedded field', () => {
        const { container } = render(
            <Formik
                initialValues={{ shouldCreateAccount: true }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} />}
            />,
        );

        expect(container.getElementsByClassName('form-field--bolt-embed')).toHaveLength(1);
    });

    it('renders bolt embedded field and shows create account checkbox', () => {
        const { container } = render(
            <Formik
                initialValues={{ shouldCreateAccount: true }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} showCreateAccountCheckbox />}
            />,
        );

        expect(container.getElementsByClassName('form-field--bolt-embed')).toHaveLength(1);
        expect(container.getElementsByClassName('optimizedCheckout-form-checkbox')).toHaveLength(1);
    });

    it('renders bolt embedded field without showing create account checkbox', () => {
        const { container } = render(
            <Formik
                initialValues={{ shouldCreateAccount: false }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} />}
            />,
        );

        expect(container.getElementsByClassName('form-field--bolt-embed')).toHaveLength(1);
        expect(container.getElementsByClassName('optimizedCheckout-form-checkbox')).toHaveLength(0);
    });

    it('renders bolt embedded field with checked account creation checkbox by default', () => {
        const { container } = render(
            <Formik
                initialValues={{ shouldCreateAccount: true }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} showCreateAccountCheckbox />}
            />,
        );

        const checkbox = container.getElementsByClassName('optimizedCheckout-form-checkbox')[0];

        expect(checkbox.checked).toBe(true);
    });
});
