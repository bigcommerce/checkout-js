import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { getCardInstrument, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import HostedWidgetPaymentComponent, {
    type HostedWidgetComponentProps,
    type PaymentContextProps,
} from './HostedWidgetPaymentComponent';

jest.mock('@bigcommerce/checkout/instrument-utils', () => ({
    ...jest.requireActual<typeof import('@bigcommerce/checkout/instrument-utils')>(
        '@bigcommerce/checkout/instrument-utils',
    ),
    CardInstrumentFieldset: ({
        instruments,
        onDeleteInstrument,
        onUseNewInstrument,
    }: {
        instruments: CardInstrument[];
        onDeleteInstrument?(id: string): void;
        onUseNewInstrument(): void;
    }) => (
        <div data-test="card-instrument-fieldset">
            {instruments.map((instrument) => (
                <button
                    data-test={`delete-${instrument.bigpayToken}`}
                    key={instrument.bigpayToken}
                    onClick={() => onDeleteInstrument?.(instrument.bigpayToken)}
                    type="button"
                >
                    Delete {instrument.bigpayToken}
                </button>
            ))}
            <button data-test="use-new-card" onClick={onUseNewInstrument} type="button">
                Use a new card
            </button>
        </div>
    ),
    StoreInstrumentFieldset: () => null,
}));

describe('HostedWidgetPaymentComponent', () => {
    let defaultProps: HostedWidgetComponentProps & PaymentContextProps;
    let initializePayment: jest.Mock;
    let deinitializePayment: jest.Mock;

    beforeEach(() => {
        initializePayment = jest.fn().mockResolvedValue({});
        deinitializePayment = jest.fn().mockResolvedValue({});

        defaultProps = {
            instruments: [],
            isInstrumentFeatureAvailable: true,
            isLoadingInstruments: false,
            isPaymentDataRequired: true,
            isSignedIn: true,
            isInstrumentCardCodeRequired: jest.fn().mockReturnValue(false),
            isInstrumentCardNumberRequired: jest.fn().mockReturnValue(false),
            loadInstruments: jest.fn().mockResolvedValue({}),
            signOut: jest.fn(),
            containerId: 'payment-widget-container',
            method: getPaymentMethod(),
            deinitializePayment,
            initializePayment,
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setFieldValue: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };
    });

    it('switches to the new-card view and reinitializes without the deleted instrument when the last stored card is deleted', async () => {
        const instrument = getCardInstrument();

        const { container } = render(
            <HostedWidgetPaymentComponent {...defaultProps} instruments={[instrument]} />,
        );

        await waitFor(() => expect(initializePayment).toHaveBeenCalledTimes(1));
        expect(initializePayment).toHaveBeenNthCalledWith(
            1,
            { gatewayId: defaultProps.method.gateway, methodId: defaultProps.method.id },
            instrument,
        );

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        const widgetContainer = container.querySelector(`#${defaultProps.containerId}`);

        // The card number field is hidden while a stored instrument is in use.
        expect(widgetContainer).toHaveStyle({ display: 'none' });

        fireEvent.click(screen.getByTestId(`delete-${instrument.bigpayToken}`));

        expect(defaultProps.setFieldValue).toHaveBeenCalledWith('instrumentId', '');

        expect(widgetContainer).not.toHaveStyle({ display: 'none' });

        await waitFor(() => expect(initializePayment).toHaveBeenCalledTimes(2));
        expect(initializePayment).toHaveBeenNthCalledWith(
            2,
            { gatewayId: defaultProps.method.gateway, methodId: defaultProps.method.id },
            undefined,
        );
        expect(deinitializePayment).toHaveBeenCalledTimes(1);
    });

    it('keeps the instrument selected when a different, non-selected instrument is deleted', async () => {
        const selected = getCardInstrument();
        const other = {
            ...getCardInstrument(),
            bigpayToken: 'other-token',
            defaultInstrument: false,
        };

        render(<HostedWidgetPaymentComponent {...defaultProps} instruments={[selected, other]} />);

        await waitFor(() => expect(initializePayment).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByTestId(`delete-${other.bigpayToken}`));

        expect(defaultProps.setFieldValue).not.toHaveBeenCalled();
        await waitFor(() => expect(initializePayment).toHaveBeenCalledTimes(1));
    });

    it('does not trigger an overlapping reinitialization when switching to a new card', async () => {
        const instrumentA = getCardInstrument();
        const instrumentB = {
            ...getCardInstrument(),
            bigpayToken: 'other-token',
            defaultInstrument: false,
        };

        render(
            <HostedWidgetPaymentComponent
                {...defaultProps}
                instruments={[instrumentA, instrumentB]}
            />,
        );

        await waitFor(() => expect(initializePayment).toHaveBeenCalledTimes(1));

        fireEvent.click(screen.getByTestId('use-new-card'));

        await waitFor(() => expect(initializePayment).toHaveBeenCalledTimes(2));

        expect(initializePayment).toHaveBeenNthCalledWith(2, {
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
        });
        expect(deinitializePayment).toHaveBeenCalledTimes(1);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(initializePayment).toHaveBeenCalledTimes(2);
        expect(deinitializePayment).toHaveBeenCalledTimes(1);
    });
});
