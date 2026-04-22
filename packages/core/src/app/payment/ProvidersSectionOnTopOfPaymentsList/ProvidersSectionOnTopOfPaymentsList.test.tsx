import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getPaymentMethod } from '../payment-methods.mock';

import { ProvidersSectionOnTopOfPaymentsList } from './ProvidersSectionOnTopOfPaymentsList';

describe('ProvidersSectionOnTopOfPaymentsList', () => {
    it('returns null when methods array is empty', () => {
        const { container } = render(
            <ProvidersSectionOnTopOfPaymentsList methods={[]} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('returns null when no methods have hasSectionOnTopOfPaymentsList', () => {
        const method: PaymentMethod = {
            ...getPaymentMethod(),
            initializationData: {},
        };

        const { container } = render(
            <ProvidersSectionOnTopOfPaymentsList methods={[method]} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('returns null when initializationData is undefined', () => {
        const method: PaymentMethod = {
            ...getPaymentMethod(),
            initializationData: undefined,
        };

        const { container } = render(
            <ProvidersSectionOnTopOfPaymentsList methods={[method]} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders container div for method with hasSectionOnTopOfPaymentsList', () => {
        const method: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'stripe',
            gateway: undefined,
            initializationData: { hasSectionOnTopOfPaymentsList: true },
        };

        render(
            <ProvidersSectionOnTopOfPaymentsList methods={[method]} />,
        );

        expect(
            screen.getByTestId('stripe-provider-section-on-top-of-payments-list'),
        ).toBeInTheDocument();
    });

    it('renders container id with gateway prefix when gateway is set', () => {
        const method: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'card',
            gateway: 'stripeupe',
            initializationData: { hasSectionOnTopOfPaymentsList: true },
        };

        render(
            <ProvidersSectionOnTopOfPaymentsList methods={[method]} />,
        );

        expect(
            screen.getByTestId('stripeupe-card-provider-section-on-top-of-payments-list'),
        ).toBeInTheDocument();
    });

    it('renders containers only for eligible methods', () => {
        const eligibleMethod: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'stripe',
            gateway: undefined,
            initializationData: { hasSectionOnTopOfPaymentsList: true },
        };

        const ineligibleMethod: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'authorizenet',
            gateway: undefined,
            initializationData: {},
        };

        render(
            <ProvidersSectionOnTopOfPaymentsList
                methods={[eligibleMethod, ineligibleMethod]}
            />,
        );

        expect(
            screen.getByTestId('stripe-provider-section-on-top-of-payments-list'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('authorizenet-provider-section-on-top-of-payments-list'),
        ).not.toBeInTheDocument();
    });

    it('renders multiple containers for multiple eligible methods', () => {
        const method1: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'card',
            gateway: 'stripeupe',
            initializationData: { hasSectionOnTopOfPaymentsList: true },
        };

        const method2: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'card',
            gateway: 'stripeocs',
            initializationData: { hasSectionOnTopOfPaymentsList: true },
        };

        render(
            <ProvidersSectionOnTopOfPaymentsList methods={[method1, method2]} />,
        );

        expect(
            screen.getByTestId('stripeupe-card-provider-section-on-top-of-payments-list'),
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('stripeocs-card-provider-section-on-top-of-payments-list'),
        ).toBeInTheDocument();
    });
});
