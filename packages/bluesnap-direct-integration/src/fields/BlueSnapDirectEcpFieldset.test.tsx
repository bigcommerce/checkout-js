import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { BluesnapECPAccountType } from '../constants';

import BlueSnapDirectEcpFieldset, {
    type BlueSnapDirectEcpFieldsetProps,
} from './BlueSnapDirectEcpFieldset';

describe('BlueSnapDirectEcpFieldset', () => {
    let initialValues: { [key: string]: unknown };
    let options: BlueSnapDirectEcpFieldsetProps;

    beforeEach(() => {
        initialValues = {
            accountNumber: '',
            routingNumber: '',
            companyName: '',
            accountType: BluesnapECPAccountType.ConsumerChecking,
        };
        options = {
            language: createLanguageService(),
            shouldRenderCompanyName: true,
        };
    });

    it('renders BlueSnapDirectEcpFieldset', () => {
        expect(
            render(
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <BlueSnapDirectEcpFieldset {...options} />
                </Formik>,
            ),
        );
        expect(screen.getByTestId('companyName-text')).toBeInTheDocument();
        expect(screen.getByTestId('accountNumber-text')).toBeInTheDocument();
        expect(screen.getByTestId('routingNumber-text')).toBeInTheDocument();
        expect(screen.getByTestId('accountType-select')).toBeInTheDocument();
    });

    it("doesn't show company name field", () => {
        options = {
            ...options,
            shouldRenderCompanyName: false,
        };
        render(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <BlueSnapDirectEcpFieldset {...options} />
            </Formik>,
        );
        expect(screen.getByTestId('accountNumber-text')).toBeInTheDocument();
        expect(screen.getByTestId('routingNumber-text')).toBeInTheDocument();
        expect(screen.getByTestId('accountType-select')).toBeInTheDocument();
        expect(screen.queryByTestId('companyName-text')).not.toBeInTheDocument();
    });
});
