import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectEcpFieldset, {
    BlueSnapDirectEcpFieldsetProps,
} from './BlueSnapDirectEcpFieldset';

describe('BlueSnapDirectEcpFieldset', () => {
    let initialValues: { [key: string]: unknown };
    let options: BlueSnapDirectEcpFieldsetProps;

    beforeEach(() => {
        initialValues = {
            accountNumber: '',
            routingNumber: '',
        };
        options = {
            language: createLanguageService(),
            onPermissionChange: jest.fn(),
        };
    });

    it('matches snapshot', () => {
        expect(
            render(
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <BlueSnapDirectEcpFieldset {...options} />
                </Formik>,
            ),
        ).toMatchSnapshot();
    });

    it('should call onPermissionChange callback', () => {
        render(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <BlueSnapDirectEcpFieldset {...options} />
            </Formik>,
        );

        const permissionChangeCheckbox = screen.getByLabelText(
            options.language.translate('payment.bluesnap_direct_permission'),
        );

        fireEvent.click(permissionChangeCheckbox);

        expect(options.onPermissionChange).toHaveBeenCalledWith(true);
    });
});
