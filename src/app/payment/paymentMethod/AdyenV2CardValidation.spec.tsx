import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import AdyenV2CardValidation, { AdyenV2CardValidationProps } from './AdyenV2CardValidation';

describe('AdyenV2CardValidation', () => {
    let defaultProps: AdyenV2CardValidationProps;
    let AdyenV2CardValidationTest: FunctionComponent<AdyenV2CardValidationProps>;

    beforeEach(() => {
        defaultProps = {
            verificationFieldsContainerId: 'container',
            shouldShowNumberField: true,
        };

        AdyenV2CardValidationTest = props => (
            <AdyenV2CardValidation { ...props } />
        );
    });

    it('renders Adyen V2 secured fields', () => {
        const container = mount(<AdyenV2CardValidationTest { ...defaultProps } />);

        expect(container.props())
            .toEqual(expect.objectContaining({
                verificationFieldsContainerId: 'container',
                shouldShowNumberField: true,
            }));
    });
});
