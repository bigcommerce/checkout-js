import { type CheckoutService, createCheckoutService, type StripeShippingEvent } from '@bigcommerce/checkout-sdk';
import noop from 'lodash/noop';
import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import CheckoutStepType from '../../checkout/CheckoutStepType';
import { getCountries } from '../../geography/countries.mock';
import { getConsignment } from '../consignment.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import StripeShippingAddress, { type StripeShippingAddressProps } from './StripeShippingAddress';

describe('StripeShippingAddress Component', () => {
    let checkoutService: CheckoutService;
    let defaultProps: StripeShippingAddressProps;
    const dummyElement = document.createElement('div');
    const methodId = 'stripeupe';
    const stripeEvent: StripeShippingEvent = {
        complete: true,
        elementType: 'shipping',
        empty: false,
        isNewAddress: false,
        phoneFieldRequired: false,
        value: {
            address: {
                city: 'string',
                country: 'US',
                line1: 'string',
                postal_code: 'string',
                state: 'string',
            },
            name: 'cosme fulanito',
            phone: '',
        },
    };

    const renderTestComponent = (props?: Partial<StripeShippingAddressProps>) => 
        render(<StripeShippingAddress {...defaultProps} {...props} />);

    const getInitializeMock = (
        onChangeShippingPayload?: StripeShippingEvent,
        stripeExperiments: Record<string, boolean> = {},
    ): jest.Mock => 
        jest.fn((options) => {
            const {
                getStyles = noop,
                onChangeShipping = noop,
                setStripeExperiments = noop,
            } = options.stripeupe || {};
            
            setStripeExperiments(stripeExperiments);
            onChangeShipping(onChangeShippingPayload || stripeEvent);
            getStyles();

            return Promise.resolve(checkoutService.getState());
        });

    beforeAll(() => {
        checkoutService = createCheckoutService();

        defaultProps = {
            consignments: [getConsignment()],
            shippingAddress: {
                ...getShippingAddress(),
                address1: 'x',
            },
            step: { isActive: false,
                isComplete: false,
                isEditable: false,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Shipping },
            isStripeLoading: jest.fn(),
            isShippingMethodLoading: false,
            shouldDisableSubmit: false,
            countries: getCountries(),
            onSubmit: jest.fn(),
            onAddressSelect: jest.fn(),
            initialize: jest.fn(),
            deinitialize: jest.fn(),
        };

        jest.mock('@bigcommerce/checkout/dom-utils', () => ({
            getAppliedStyles: () => {
                return { color: '#cccccc' };
            },
        }));
        jest.spyOn(document, 'getElementById')
            .mockReturnValue(dummyElement);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders StripeShippingAddress with initialize props', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            value: { ...stripeEvent.value, address: { ...stripeEvent.value.address, line2: 'string' } },
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalledWith({
            methodId: 'stripeupe',
            stripeupe: {
                container: 'StripeUpeShipping',
                onChangeShipping: expect.any(Function),
                availableCountries: 'AU, US, JP',
                getStyles: expect.any(Function),
                getStripeState: expect.any(Function),
                gatewayId: 'stripeupe',
                methodId: 'card',
            },
        });
        expect(defaultProps.onAddressSelect).toHaveBeenCalled();
    });

    it('deinitialize StripeShippingAddress component', async () => {
        defaultProps.initialize = getInitializeMock();

        const { unmount } = renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.onAddressSelect).toHaveBeenCalled();

        unmount();

        expect(defaultProps.deinitialize).toHaveBeenCalledWith({ methodId });
    });

    it('renders StripeShippingAddress without name', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            value: { ...stripeEvent.value, name: undefined },
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: '',
                lastName: undefined,
            }),
        );
    });

    it('renders StripeShippingAddress without last name', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            value: { ...stripeEvent.value, name: 'cosme' },
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'cosme',
                lastName: undefined,
            }),
        );
    });

    it('renders StripeShippingAddress props with first and last name', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'cosme',
                lastName: 'fulanito',
            }),
        );
        expect(defaultProps.isStripeLoading).not.toHaveBeenCalled();
    });

    it('renders loader for new Stripe address', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            isNewAddress: undefined,
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.isStripeLoading).toHaveBeenCalled();
    });

    it('renders StripeShippingAddress when phone is required', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            phoneFieldRequired: true,
            value: { ...stripeEvent.value, phone: '+523333333333' },
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: '+523333333333',
            }),
        );
        expect(defaultProps.isStripeLoading).not.toHaveBeenCalled();
    });

    it('renders loader when phone is required but not filled', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            phoneFieldRequired: true,
            value: { ...stripeEvent.value, phone: '' },
        });

        renderTestComponent();

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: '',
            }),
        );
        expect(defaultProps.isStripeLoading).toHaveBeenCalled();
    });

    it('renders StripeShippingAddress with initialize props when phone is not required', async () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            phoneFieldRequired: false,
            value: { ...stripeEvent.value, phone: '+523333333333' },
        });

        renderTestComponent();

        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: '+523333333333',
            }),
        );
        expect(defaultProps.isStripeLoading).not.toHaveBeenCalled();
    });

    it('set country from available shipping countries', () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
        });

        renderTestComponent();

        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                countryCode: 'US',
                country: 'United States',
            }),
        );
    });

    it('set base country from Stripe event when now available shipping countries', () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
        });

        renderTestComponent({
            countries: undefined,
        });

        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                countryCode: 'US',
                country: 'US',
            }),
        );
    });

    it('set base country from Stripe event when shopper country not from available list', () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            value: {
                ...stripeEvent.value,
                address: {
                    ...stripeEvent.value.address,
                    country: 'GB',
                }
            },
        });

        renderTestComponent();

        expect(defaultProps.onAddressSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                countryCode: 'GB',
                country: 'GB',
            }),
        );
    });

    it('handle loading if no available shipping options', () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
        });

        renderTestComponent({
            consignments: [
                {
                    ...defaultProps.consignments[0],
                    availableShippingOptions: [],
                }
            ]
        });

        expect(defaultProps.isStripeLoading).toHaveBeenCalled();
    });

    it('auto submit if has available shipping option for stripe address', () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
        });

        renderTestComponent({
            isStripeAutoStep: jest.fn(),
        });

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it('shows loader when address filling not completed', () => {
        defaultProps.initialize = getInitializeMock({
            ...stripeEvent,
            complete: false,
        });

        renderTestComponent({
            isStripeAutoStep: jest.fn(),
        });

        expect(defaultProps.onAddressSelect).not.toHaveBeenCalled();
        expect(defaultProps.isStripeLoading).toHaveBeenCalled();
    });

    it('skip styling if no theme inputs container found', () => {
        const getAppliedStylesMock = jest.fn();

        jest.mock('@bigcommerce/checkout/dom-utils', () => ({
            getAppliedStyles: getAppliedStylesMock,
        }));

        jest.spyOn(document, 'getElementById')
            .mockReturnValue(null);

        defaultProps.initialize = getInitializeMock();

        renderTestComponent();

        expect(getAppliedStylesMock).not.toHaveBeenCalled();
    });
});
