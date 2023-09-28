import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import { LocaleProvider } from '@bigcommerce/checkout/locale';

import { PaymentsWithMandates, PaymentsWithMandatesProps } from './PaymentsWithMandates';
import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';

describe('PaymentsWithMandates', () => {
    let PaymentsWithMandatesTest: FunctionComponent<PaymentsWithMandatesProps>;
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        PaymentsWithMandatesTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <PaymentsWithMandates {...props}/>
            </LocaleProvider>
        )
    });

    it ('renders confirmation mandate link text if mandate has url', async () => {
        const props = {
            paymentsWithMandates: [{
                detail: {
                    step: '1',
                    instructions: '1',
                },
                description: 'test',
                amount: 1,
                providerId: 'paypalcommercealternativemethod',
                methodId: 'ratepay',
                mandate: {
                    id: '',
                    url: 'Test Url',
                    mandateText: {},
                }
            }],
        }
        render(<PaymentsWithMandatesTest {...props} />);

        const url = await screen.findByTestId('order-confirmation-mandate-link-text');

        expect(url).toBeInTheDocument();
    });

    it ('renders confirmation mandate id text if mandate  id is defined', async () => {
        const props = {
            paymentsWithMandates: [{
                detail: {
                    step: '1',
                    instructions: '1',
                },
                description: 'test',
                amount: 1,
                providerId: 'paypalcommercealternativemethod',
                methodId: 'ratepay',
                mandate: {
                    id: '1',
                    url: '',
                    mandateText: {},
                }
            }],
        }
        render(<PaymentsWithMandatesTest {...props} />);

        const id = await screen.findByTestId('order-confirmation-mandate-id-text');

        expect(id).toBeInTheDocument();
    });

    it ('renders MandateTextComponent if mandateText object is not empty', async () => {
        const props = {
            paymentsWithMandates: [{
                detail: {
                    step: '1',
                    instructions: '1',
                },
                description: 'test',
                amount: 1,
                providerId: 'paypalcommercealternativemethod',
                methodId: 'ratepay',
                mandate: {
                    id: '',
                    url: '',
                    mandateText: {
                        account_holder_name: 'Account Holder'
                    },
                }
            }],
        }
        render(<PaymentsWithMandatesTest {...props} />);

        const mandateTextList = await screen.findByTestId('order-confirmation-mandate-text-list');

        expect(mandateTextList).toBeInTheDocument();
    });
});
