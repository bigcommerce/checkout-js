import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import BoltCustomForm, { BoltCustomFormProps } from './BoltCustomForm';

/* eslint-disable react/jsx-no-bind */
describe('BoltCustomForm', () => {
    let defaultProps: BoltCustomFormProps;
    let BoltCustomFormTest: FunctionComponent<BoltCustomFormProps>;

    beforeEach(() => {
        defaultProps = {
            containerId: 'boltEmbeddedOneClick',
            showCreateAccountCheckbox: false,
        };

        BoltCustomFormTest = props => (
            <BoltCustomForm { ...props } />
        );
    });

    it('renders bolt embedded field', () => {
        const container = mount(
            <Formik
                initialValues={ { shouldCreateAccount: true } }
                onSubmit={ noop }
                render={ () => <BoltCustomFormTest { ...defaultProps } /> }
            />
        );

        expect(container.find('[id="boltEmbeddedOneClick"]').exists()).toEqual(true);
    });

    it('renders bolt embedded field and shows create account checkbox', () => {
        const container = mount(
            <Formik
                initialValues={ { shouldCreateAccount: true } }
                onSubmit={ noop }
                render={ () => <BoltCustomFormTest { ...defaultProps } showCreateAccountCheckbox /> }
            />
        );

        expect(container.find('[id="boltEmbeddedOneClick"]').exists()).toEqual(true);
        expect(container.find('[id="shouldCreateAccount"]').exists()).toEqual(true);
    });

    it('renders bolt embedded field without showing create account checkbox', () => {
        const container = mount(
            <Formik
                initialValues={ { shouldCreateAccount: false } }
                onSubmit={ noop }
                render={ () => <BoltCustomFormTest { ...defaultProps } /> }
            />
        );

        expect(container.find('[id="boltEmbeddedOneClick"]').exists()).toEqual(true);
        expect(container.find('[id="shouldCreateAccount"]').exists()).toEqual(false);
    });

    it('renders bolt embedded field with checked account creation checkbox by default', () => {
        const container = mount(
            <Formik
                initialValues={ { shouldCreateAccount: true } }
                onSubmit={ noop }
                render={ () => <BoltCustomFormTest { ...defaultProps } showCreateAccountCheckbox /> }
            />
        );

        expect(container.find('[id="shouldCreateAccount"]').hostNodes().props().checked).toEqual(true);
    });
});
