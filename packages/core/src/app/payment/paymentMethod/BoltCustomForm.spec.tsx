import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';

import BoltCustomForm, { BoltCustomFormProps } from './BoltCustomForm';

describe('BoltCustomForm', () => {
    let defaultProps: BoltCustomFormProps;
    let BoltCustomFormTest: FunctionComponent<BoltCustomFormProps>;

    beforeEach(() => {
        defaultProps = {
            containerId: 'boltEmbeddedOneClick',
            showCreateAccountCheckbox: false,
        };

        const checkoutService = createCheckoutService();

        BoltCustomFormTest = (props) => <LocaleProvider checkoutService={checkoutService}><BoltCustomForm {...props} /></LocaleProvider>;
    });

    it('renders bolt embedded field', () => {
        const container = mount(
            <Formik
                initialValues={{ shouldCreateAccount: true }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} />}
            />,
        );

        expect(container.find('[id="boltEmbeddedOneClick"]').exists()).toBe(true);
    });

    it('renders bolt embedded field and shows create account checkbox', () => {
        const container = mount(
            <Formik
                initialValues={{ shouldCreateAccount: true }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} showCreateAccountCheckbox />}
            />,
        );

        expect(container.find('[id="boltEmbeddedOneClick"]').exists()).toBe(true);
        expect(container.find('[id="shouldCreateAccount"]').exists()).toBe(true);
    });

    it('renders bolt embedded field without showing create account checkbox', () => {
        const container = mount(
            <Formik
                initialValues={{ shouldCreateAccount: false }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} />}
            />,
        );

        expect(container.find('[id="boltEmbeddedOneClick"]').exists()).toBe(true);
        expect(container.find('[id="shouldCreateAccount"]').exists()).toBe(false);
    });

    it('renders bolt embedded field with checked account creation checkbox by default', () => {
        const container = mount(
            <Formik
                initialValues={{ shouldCreateAccount: true }}
                onSubmit={noop}
                render={() => <BoltCustomFormTest {...defaultProps} showCreateAccountCheckbox />}
            />,
        );

        expect(container.find('[id="shouldCreateAccount"]').hostNodes().props().checked).toBe(true);
    });
});
