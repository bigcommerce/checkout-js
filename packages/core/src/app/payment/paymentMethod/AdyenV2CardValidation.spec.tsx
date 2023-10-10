import { AdyenV2ValidationState, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';

import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import AdyenV2CardValidation, { AdyenV2CardValidationProps } from './AdyenV2CardValidation';

describe('AdyenV2CardValidation', () => {
    let defaultProps: AdyenV2CardValidationProps;
    let paymentContext: PaymentContextProps;
    let AdyenV2CardValidationTest: FunctionComponent<AdyenV2CardValidationProps>;

    const checkoutService = createCheckoutService();

    beforeEach(() => {
        AdyenV2CardValidationTest = (props) => <LocaleProvider checkoutService={checkoutService}><AdyenV2CardValidation {...props} /></LocaleProvider>;
    });

    it('renders Adyen V2 Card Number and CVV fields', () => {
        defaultProps = {
            paymentMethod: {
                method: 'scheme',
            },
            shouldShowNumberField: true,
            verificationFieldsContainerId: 'container',
        };

        const container = mount(<AdyenV2CardValidationTest {...defaultProps} />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
        expect(field).toHaveLength(1);
    });

    it('renders Adyen V2 Card Number and Expiry Date fields', () => {
        defaultProps = {
            paymentMethod: {
                method: 'bcmc',
            },
            shouldShowNumberField: true,
            verificationFieldsContainerId: 'container',
        };

        const container = mount(<AdyenV2CardValidationTest {...defaultProps} />);

        const field = container.find('[id="encryptedExpiryDate"]');

        expect(field).toHaveLength(1);
    });

    it('render with empty required fields', () => {
        defaultProps = {
            paymentMethod: {
                method: 'scheme',
            },
            shouldShowNumberField: false,
            verificationFieldsContainerId: 'container',
            cardValidationState: {} as AdyenV2ValidationState,
        };

        const container = mount(<AdyenV2CardValidationTest {...defaultProps} />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
    });

    it('render with invalid fields', () => {
        defaultProps = {
            paymentMethod: {
                method: 'scheme',
            },
            shouldShowNumberField: false,
            verificationFieldsContainerId: 'container',
            cardValidationState: {
                fieldType: 'encryptedSecurityCode',
                valid: false,
            } as AdyenV2ValidationState,
        };

        const container = mount(<AdyenV2CardValidationTest {...defaultProps} />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
    });

    describe('validation spec', () => {
        beforeEach(() => {
            defaultProps = {
                paymentMethod: {
                    method: 'scheme',
                },
                shouldShowNumberField: true,
                verificationFieldsContainerId: 'container',
                selectedInstrument: {
                    bigpayToken: '123',
                    brand: 'visa',
                    defaultInstrument: false,
                    expiryMonth: '03',
                    expiryYear: '2030',
                    iin: '1',
                    last4: '1111',
                    method: 'scheme',
                    provider: 'adyenv2',
                    trustedShippingAddress: false,
                    type: 'card',
                },
            };
        });

        it('should render error when entered last 4 symbols is not equal to the last 4 from selected card', () => {
            defaultProps = {
                paymentMethod: {
                    method: 'scheme',
                },
                shouldShowNumberField: true,
                verificationFieldsContainerId: 'container',
                selectedInstrument: {
                    bigpayToken: '123',
                    brand: 'visa',
                    defaultInstrument: false,
                    expiryMonth: '03',
                    expiryYear: '2030',
                    iin: '1',
                    last4: '1111',
                    method: 'scheme',
                    provider: 'adyenv2',
                    trustedShippingAddress: false,
                    type: 'card',
                },
            };

            const container = mount(<AdyenV2CardValidationTest {...defaultProps} />);

            container.setProps({
                cardValidationState: {
                    blob: 'adyenjs_',
                    encryptedFieldName: 'encryptedCardNumber',
                    endDigits: '0000',
                    fieldType: 'encryptedCardNumber',
                    valid: true,
                },
            });
            container.update();

            const field = container.find('[id="encryptedCardNumber"]');

            expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
            expect(field).toHaveLength(1);
        });

        it('should NOT render error when entered last 4 symbols is equal to the last 4 from selected card', () => {
            const container = mount(<AdyenV2CardValidationTest {...defaultProps} />);

            container.setProps({
                cardValidationState: {
                    blob: 'adyenjs_',
                    encryptedFieldName: 'encryptedCardNumber',
                    endDigits: '1111',
                    fieldType: 'encryptedCardNumber',
                    valid: true,
                },
            });
            container.update();

            const field = container.find('[id="encryptedCardNumber"]');

            expect(field.hasClass('adyen-checkout__input--error')).toBeFalsy();
            expect(field).toHaveLength(1);
        });

    });
});
