import { difference } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { getAppliedStyles, LoadingOverlay } from '@bigcommerce/checkout/ui';

const SquareV2PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
}) => {
    const renderPlaceholderFields = () => {
        return (
            <div data-test="squarev2_placeholder_form" style={{ display: 'none' }}>
                <div className="form-field">
                    <div
                        className="form-label optimizedCheckout-form-label"
                        id="messageIsDefault"
                    />
                    <div className="form-input optimizedCheckout-form-input" id="inputIsDefault" />
                </div>
                <div className="form-field">
                    <div
                        className="form-input optimizedCheckout-form-input form-input--focus optimizedCheckout-form-input--focus"
                        id="inputIsFocus"
                    />
                </div>
                <div className="form-field form-field--error">
                    <div className="form-inlineMessage" id="messageIsError" />
                    <div className="form-input optimizedCheckout-form-input" id="inputIsError" />
                </div>
            </div>
        );
    };

    const getStylesFromElement = (id: string, properties: string[]) => {
        const container = document.querySelector<HTMLDivElement>(`#${id}`);

        if (!container) {
            throw new Error(
                `Unable to retrieve input styles as the provided container ID "${id}" is not valid.`,
            );
        }

        return getAppliedStyles(container, properties);
    };

    const copyStylesFromDummyFormFields = useCallback(() => {
        const styleProps = [
            'backgroundColor',
            'borderColor',
            'borderRadius',
            'borderWidth',
            'color',
            'fontSize',
            'fontWeight',
        ];

        return {
            default: {
                message: getStylesFromElement('messageIsDefault', ['color']),
                input: getStylesFromElement('inputIsDefault', styleProps),
            },
            focus: {
                input: getStylesFromElement(
                    'inputIsFocus',
                    difference(styleProps, ['borderRadius']),
                ),
            },
            error: {
                message: getStylesFromElement('messageIsError', ['color']),
                input: getStylesFromElement('inputIsError', [
                    'borderColor',
                    'borderWidth',
                    'color',
                ]),
            },
        };
    }, []);

    const mapToSquareStyles = useCallback(
        (styles: ReturnType<typeof copyStylesFromDummyFormFields>) => {
            const { borderColor, borderRadius, borderWidth, ...input } = styles.default.input;
            const {
                borderColor: borderColorIsFocus,
                borderWidth: borderWidthIsFocus,
                ...inputIsFocus
            } = styles.focus.input;
            const {
                borderColor: borderColorIsError,
                borderWidth: borderWidthIsError,
                color: colorIsError,
            } = styles.error.input;

            return {
                input,
                'input.is-focus': {
                    ...inputIsFocus,
                },
                'input.is-error': {
                    color: colorIsError,
                },
                '.input-container': {
                    borderColor,
                    borderRadius,
                    borderWidth,
                },
                '.input-container.is-focus': {
                    borderColor: borderColorIsFocus,
                    borderWidth: borderWidthIsFocus,
                },
                '.input-container.is-error': {
                    borderColor: borderColorIsError,
                    borderWidth: borderWidthIsError,
                },
                '.message-text': {
                    color: styles.default.message.color,
                },
                '.message-icon': {
                    color: styles.default.message.color,
                },
                '.message-text.is-error': {
                    color: styles.error.message.color,
                },
                '.message-icon.is-error': {
                    color: styles.error.message.color,
                },
            };
        },
        [],
    );

    const containerId = 'squarev2_payment_element_container';

    const initializePayment = useCallback(async () => {
        let style;

        try {
            style = mapToSquareStyles(copyStylesFromDummyFormFields());
        } catch {
            /* Do nothing: we should not block shoppers from buying. */
        }

        await checkoutService.initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
            squarev2: {
                containerId,
                style,
            },
        });
    }, [
        checkoutService,
        copyStylesFromDummyFormFields,
        mapToSquareStyles,
        method.gateway,
        method.id,
    ]);

    const deinitializePayment = useCallback(async () => {
        await checkoutService.deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [checkoutService, method.gateway, method.id]);

    useEffect(() => {
        void initializePayment();

        return () => {
            void deinitializePayment();
        };
    }, [deinitializePayment, initializePayment]);

    return (
        <div className="loadingSpinner">
            <LoadingOverlay isLoading={checkoutState.statuses.isInitializingPayment(method.id)}>
                {renderPlaceholderFields()}
                <div id={containerId} style={{ minHeight: '100px' }} />
            </LoadingOverlay>
        </div>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    SquareV2PaymentMethod,
    [{ id: 'squarev2' }],
);
