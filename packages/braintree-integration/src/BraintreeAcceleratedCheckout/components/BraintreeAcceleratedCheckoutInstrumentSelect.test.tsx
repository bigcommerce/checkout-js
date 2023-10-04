import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Field, FieldProps, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { PaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCardInstrument,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentSelect from './BraintreeAcceleratedCheckoutInstrumentSelect';

jest.mock('@bigcommerce/checkout/paypal-connect-integration', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    PoweredByPaypalConnectLabel: jest.fn(() => (
        <div data-test="powered-by-paypal-connect-label">PoweredByPaypalConnectLabel</div>
    )),
}));

describe('BraintreeAcceleratedCheckoutInstrumentSelect', () => {
    it('renders instrument select', () => {
        const cardInstrument = getCardInstrument();

        const view = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <PaymentFormContext.Provider
                        value={{ paymentForm: getPaymentFormServiceMock() }}
                    >
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
                </LocaleContext.Provider>
            </Formik>,
        );

        expect(view).toMatchSnapshot();
    });

    it('renders form to create new instrument and does not render paypal connect label under instruments select', () => {
        const cardInstrument = getCardInstrument();

        render(
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <PaymentFormContext.Provider
                        value={{ paymentForm: getPaymentFormServiceMock() }}
                    >
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
                </LocaleContext.Provider>
            </Formik>,
        );

        expect(screen.queryByTestId('powered-by-paypal-connect-label')).not.toBeInTheDocument();
    });
});
