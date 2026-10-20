import React from 'react';

import * as contexts from '@bigcommerce/checkout/contexts';
import { getCart, getCheckout, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import CheckoutStepType from '../CheckoutStepType';

import ShippingStep, { type ShippingStepProps } from './ShippingStep';

jest.mock('../../shipping/Shipping', () => ({
    __esModule: true,
    default: () => <div data-test="shipping" />,
}));

describe('ShippingStep', () => {
    const defaultProps: ShippingStepProps = {
        step: {
            isActive: true,
            isBusy: false,
            isComplete: false,
            isEditable: false,
            isRequired: true,
            type: CheckoutStepType.Shipping,
        },
        cart: getCart(),
        consignments: [],
        cartHasChanged: false,
        isBillingSameAsShipping: true,
        isMultiShippingMode: false,
        navigateNextStep: jest.fn(),
        onCreateAccount: jest.fn(),
        onEdit: jest.fn(),
        onExpanded: jest.fn(),
        onSignIn: jest.fn(),
        onToggleMultiShipping: jest.fn(),
        onUnhandledError: jest.fn(),
        setIsMultishippingMode: jest.fn(),
    };

    const mockCheckoutState = (selectedState: { checkout?: unknown; config?: unknown }) => {
        jest.spyOn(contexts, 'useCheckout').mockReturnValue({
            selectedState,
        } as unknown as ReturnType<typeof contexts.useCheckout>);
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        ['cart', { checkout: getCheckout(), config: getStoreConfig() }, { cart: undefined }],
        ['checkout', { config: getStoreConfig() }, {}],
        ['config', { checkout: getCheckout() }, {}],
    ])('renders nothing when %s is missing from state', (_name, selectedState, propOverrides) => {
        mockCheckoutState(selectedState);

        const { container } = render(<ShippingStep {...defaultProps} {...propOverrides} />);

        expect(container).toBeEmptyDOMElement();
    });
});
