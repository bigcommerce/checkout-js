import { createCheckoutService, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import MollieCustomCardForm, { type MollieCustomCardFormProps } from './MollieCustomCardForm';

describe('MollieCustomForm', () => {
    const method: PaymentMethod = {
        id: 'mollie',
        method: 'kbc/cbc',
        supportedCards: [],
        config: {},
        type: 'card',
        initializationData: {
            paymentMethodsResponse: [
                {
                    resource: 'kbc',
                    id: 'kbc',
                    name: 'kbc',
                    image: {
                        size1x: 'logo.png',
                    },
                },
            ],
        },
    };
    const options = {
        cardNumberElementOptions: {
            containerId: 'cnumber_containerId',
        },
        cardExpiryElementOptions: {
            containerId: 'expiry_containerId',
        },
        cardCvcElementOptions: {
            containerId: 'ccvc_containerId',
        },
        cardHolderElementOptions: {
            containerId: 'cholder_containerId',
        },
    };
    let MollieCustomFormTest: FunctionComponent<MollieCustomCardFormProps>;
    const checkouService = createCheckoutService();

    beforeEach(() => {
        MollieCustomFormTest = (props: MollieCustomCardFormProps) => (
            <LocaleProvider checkoutService={checkouService}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <MollieCustomCardForm {...props} />
                </Formik>
            </LocaleProvider>
        );
    });

    it('should render cc options', async () => {
        render(<MollieCustomFormTest isCreditCard={true} method={method} options={options} />);
        expect(await screen.findByText('Expiration')).toBeInTheDocument();
        expect(await screen.findByText('Credit Card Number')).toBeInTheDocument();
        expect(await screen.findByText('CVV')).toBeInTheDocument();
    });

    it('should empty render', () => {
        const { container } = render(
            <MollieCustomCardForm
                isCreditCard={false}
                method={{ ...method, initializationData: {} }}
                options={options}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('should render MollieAPMCustomForm', async () => {
        render(<MollieCustomFormTest isCreditCard={false} method={method} options={options} />);

        expect(await screen.findByText('Select your bank')).toBeInTheDocument();
    });
});
