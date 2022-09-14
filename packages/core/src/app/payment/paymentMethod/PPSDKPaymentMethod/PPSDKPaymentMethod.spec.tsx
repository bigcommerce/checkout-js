import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { PPSDKPaymentMethod } from './PPSDKPaymentMethod';

describe('when using a PPSDK payment method', () => {
    describe('with an initialisation type of "none"', () => {
        const method: PaymentMethod = {
            id: 'someId',
            gateway: 'someGateway',
            config: {},
            method: 'someMethod',
            supportedCards: [],
            type: 'PAYMENT_TYPE_SDK',
            initializationStrategy: {
                type: 'none',
            },
        };

        it('renders empty', () => {
            const container = mount(
                <PPSDKPaymentMethod
                    deinitializePayment={jest.fn().mockResolvedValue(undefined)}
                    initializePayment={jest.fn().mockResolvedValue(undefined)}
                    method={method}
                />,
            );

            expect(container.isEmptyRender()).toBe(true);
        });

        it('invokes the initializePayment callback with an options argument on mount', () => {
            const initializeMock = jest.fn().mockResolvedValue(undefined);

            mount(
                <PPSDKPaymentMethod
                    deinitializePayment={jest.fn().mockResolvedValue(undefined)}
                    initializePayment={initializeMock}
                    method={method}
                />,
            );

            expect(initializeMock).toHaveBeenCalledWith({
                methodId: 'someId',
                gatewayId: 'someGateway',
            });
        });

        it('invokes the deinitializePayment callback with an options argument on unmount', () => {
            const deinitializeMock = jest.fn().mockResolvedValue(undefined);

            const container = mount(
                <PPSDKPaymentMethod
                    deinitializePayment={deinitializeMock}
                    initializePayment={jest.fn().mockResolvedValue(undefined)}
                    method={method}
                />,
            );

            container.unmount();

            expect(deinitializeMock).toHaveBeenCalledWith({
                methodId: 'someId',
                gatewayId: 'someGateway',
            });
        });

        describe('with a failing initialization', () => {
            it('invokes the error callback', async () => {
                const errorHandlerMock = jest.fn();
                const initializeMock = jest.fn().mockRejectedValue(new Error('Some error'));

                mount(
                    <PPSDKPaymentMethod
                        deinitializePayment={jest.fn().mockResolvedValue(undefined)}
                        initializePayment={initializeMock}
                        method={method}
                        onUnhandledError={errorHandlerMock}
                    />,
                );

                await new Promise((resolve) => process.nextTick(resolve));

                expect(errorHandlerMock).toHaveBeenCalledWith(expect.any(Error));
            });
        });
    });

    describe('with an unsupported initialisation type', () => {
        interface VagueMethod extends PaymentMethod {
            initializationStrategy: any;
        }

        const unsupportedMethod: VagueMethod = {
            id: 'someId',
            gateway: 'someGateway',
            config: {},
            method: 'someMethod',
            supportedCards: [],
            type: 'PAYMENT_TYPE_SDK',
            initializationStrategy: {
                type: 'some-unsupported-type',
            },
        };

        it('renders empty', () => {
            const container = mount(
                <PPSDKPaymentMethod
                    deinitializePayment={jest.fn().mockResolvedValue(undefined)}
                    initializePayment={jest.fn().mockResolvedValue(undefined)}
                    method={unsupportedMethod}
                />,
            );

            expect(container.isEmptyRender()).toBe(true);
        });

        it('invokes the error callback', async () => {
            const errorHandlerMock = jest.fn();

            mount(
                <PPSDKPaymentMethod
                    deinitializePayment={jest.fn().mockResolvedValue(undefined)}
                    initializePayment={jest.fn().mockResolvedValue(undefined)}
                    method={unsupportedMethod}
                    onUnhandledError={errorHandlerMock}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            expect(errorHandlerMock).toHaveBeenCalledWith(expect.any(Error));
        });

        it('does not invoke the initializePayment callback on mount', () => {
            const initializeMock = jest.fn().mockResolvedValue(undefined);

            mount(
                <PPSDKPaymentMethod
                    deinitializePayment={jest.fn().mockResolvedValue(undefined)}
                    initializePayment={initializeMock}
                    method={unsupportedMethod}
                />,
            );

            expect(initializeMock).not.toHaveBeenCalled();
        });

        it('does not invoke the deinitializePayment callback on unmount', () => {
            const deinitializeMock = jest.fn().mockResolvedValue(undefined);

            const container = mount(
                <PPSDKPaymentMethod
                    deinitializePayment={deinitializeMock}
                    initializePayment={jest.fn().mockResolvedValue(undefined)}
                    method={unsupportedMethod}
                />,
            );

            container.unmount();

            expect(deinitializeMock).not.toHaveBeenCalled();
        });
    });
});
