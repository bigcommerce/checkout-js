import { createCheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';

import MollieAPMCustomForm from './MollieAPMCustomForm';
import MollieCustomCardForm, { MollieCustomCardFormProps } from './MollieCustomCardForm';

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

    it('should render cc options', () => {
        const container = mount(
            <MollieCustomFormTest isCreditCard={true} method={method} options={options} />,
        );

        expect(container.find('[id="cnumber_containerId"]')).toHaveLength(1);
        expect(container.find('[id="expiry_containerId"]')).toHaveLength(1);
        expect(container.find('[id="ccvc_containerId"]')).toHaveLength(1);
        expect(container.find('[id="cholder_containerId"]')).toHaveLength(1);
    });

    it('should empty render', () => {
        const container = mount(
            <MollieCustomFormTest
                isCreditCard={false}
                method={{ ...method, initializationData: {} }}
                options={options}
            />,
        );

        expect(container.isEmptyRender()).toBe(true);
    });

    it('should render MollieAPMCustomForm', () => {
        const container = mount(
            <MollieCustomFormTest isCreditCard={false} method={method} options={options} />,
        );

        expect(container.find(MollieAPMCustomForm)).toHaveLength(1);
    });
});
