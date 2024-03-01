import '@testing-library/jest-dom';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { PaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { getCardInstrument, getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentSelect from './BraintreeAcceleratedCheckoutInstrumentSelect';

jest.mock('@bigcommerce/checkout/paypal-fastlane-integration', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PoweredByPayPalFastlaneLabel: jest.fn(() => (
        <div data-test="powered-by-paypal-fastlane-label">PoweredByPayPalFastlaneLabel</div>
    )),
}));

describe('BraintreeAcceleratedCheckoutInstrumentSelect', () => {
    it('renders instrument select', () => {
        const cardInstrument = getCardInstrument();

        const view = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <PaymentFormContext.Provider value={{ paymentForm: getPaymentFormServiceMock() }}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <BraintreeAcceleratedCheckoutInstrumentSelect
                                instruments={[cardInstrument]}
                                onSelectInstrument={noop}
                                onUseNewInstrument={noop}
                                selectedInstrument={cardInstrument}
                                {...field}
                            />
                        )}
                    />
                </PaymentFormContext.Provider>
            </Formik>,
        );

        expect(view).toMatchSnapshot();
    });

    it('renders form to create new instrument and does not render paypal fastlane label under instruments select', () => {
        const cardInstrument = getCardInstrument();

        render(
            <Formik initialValues={{}} onSubmit={noop}>
                <PaymentFormContext.Provider value={{ paymentForm: getPaymentFormServiceMock() }}>
                    <Field
                        name="instrumentId"
                        render={(field: FieldProps<string>) => (
                            <BraintreeAcceleratedCheckoutInstrumentSelect
                                instruments={[cardInstrument]}
                                onSelectInstrument={noop}
                                onUseNewInstrument={noop}
                                selectedInstrument={undefined}
                                {...field}
                            />
                        )}
                    />
                </PaymentFormContext.Provider>
            </Formik>,
        );

        expect(screen.queryByTestId('powered-by-paypal-fastlane-label')).not.toBeInTheDocument();
    });
});
