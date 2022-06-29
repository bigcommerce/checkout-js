import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import AdyenV2CardValidation, { AdyenV2CardValidationProps, AdyenV2CardValidationState } from './AdyenV2CardValidation';

describe('AdyenV2CardValidation', () => {
    let defaultProps: AdyenV2CardValidationProps;
    let AdyenV2CardValidationTest: FunctionComponent<AdyenV2CardValidationProps>;

    beforeEach(() => {
        AdyenV2CardValidationTest = props => (
            <AdyenV2CardValidation { ...props } />
        );
    });

    it('renders Adyen V2 Card Number and CVV fields', () => {
        defaultProps = {
            paymentMethodType: 'scheme',
            shouldShowNumberField: true,
            verificationFieldsContainerId: 'container',
        };

        const container = mount(<AdyenV2CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeFalsy();
        expect(field).toHaveLength(1);
    });

    it('renders Adyen V2 Card Number and Expiry Date fields', () => {
        defaultProps = {
            paymentMethodType: 'bcmc',
            shouldShowNumberField: true,
            verificationFieldsContainerId: 'container',
        };
        const container = mount(<AdyenV2CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedExpiryDate"]');

        expect(field).toHaveLength(1);
    });

    it('render with empty required fields', () => {
        defaultProps = {
            paymentMethodType: 'scheme',
            shouldShowNumberField: false,
            verificationFieldsContainerId: 'container',
            cardValidationState: {} as AdyenV2CardValidationState,
        };

        const container = mount(<AdyenV2CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
    });

    it('render with invalid fields', () => {
        defaultProps = {
            paymentMethodType: 'scheme',
            shouldShowNumberField: false,
            verificationFieldsContainerId: 'container',
            cardValidationState: {
                fieldType: 'encryptedSecurityCode',
                valid: false,
            } as AdyenV2CardValidationState,
        };

        const container = mount(<AdyenV2CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
    });
});
