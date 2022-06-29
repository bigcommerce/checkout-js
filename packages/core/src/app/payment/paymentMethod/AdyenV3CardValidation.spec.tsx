import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import AdyenV3CardValidation, { AdyenV3CardValidationProps, AdyenV3CardValidationState } from './AdyenV3CardValidation';

describe('AdyenV3CardValidation', () => {
    let defaultProps: AdyenV3CardValidationProps;
    let AdyenV3CardValidationTest: FunctionComponent<AdyenV3CardValidationProps>;

    beforeEach(() => {
        AdyenV3CardValidationTest = props => (
            <AdyenV3CardValidation { ...props } />
        );
    });

    it('renders Adyen V3 Card Number and CVV fields', () => {
        defaultProps = {
            paymentMethodType: 'scheme',
            shouldShowNumberField: true,
            verificationFieldsContainerId: 'container',
        };

        const container = mount(<AdyenV3CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeFalsy();
        expect(field).toHaveLength(1);
    });

    it('renders Adyen V3 Card Number and Expiry Date fields', () => {
        defaultProps = {
            paymentMethodType: 'bcmc',
            shouldShowNumberField: true,
            verificationFieldsContainerId: 'container',
        };
        const container = mount(<AdyenV3CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedExpiryDate"]');

        expect(field).toHaveLength(1);
    });

    it('render with empty required fields', () => {
        defaultProps = {
            paymentMethodType: 'scheme',
            shouldShowNumberField: false,
            verificationFieldsContainerId: 'container',
            cardValidationState: {} as AdyenV3CardValidationState,
        };

        const container = mount(<AdyenV3CardValidationTest { ...defaultProps } />);

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
            } as AdyenV3CardValidationState,
        };

        const container = mount(<AdyenV3CardValidationTest { ...defaultProps } />);

        const field = container.find('[id="encryptedSecurityCode"]');

        expect(field.hasClass('adyen-checkout__input--error')).toBeTruthy();
    });
});
