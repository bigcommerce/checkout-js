import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { difference } from 'lodash';
import React, { FunctionComponent, useCallback, useContext, useEffect, useState } from 'react';

import { getAppliedStyles } from '../../common/dom';
import PaymentContext from '../PaymentContext';

import HostedWidgetPaymentMethod , { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type SquareV2PaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const SquareV2PaymentMethod: FunctionComponent<SquareV2PaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const [disabled, setDisabled] = useState(true);
    const paymentContext = useContext(PaymentContext);

    useEffect(() => {
        paymentContext?.disableSubmit(method, disabled);

        return () => paymentContext?.disableSubmit(method, false);
    }, [paymentContext, method, disabled]);

    const onValidationChange = useCallback((isValid: boolean) => setDisabled(!isValid), [setDisabled]);
    const renderDummyFormFields = () => {
        return (
            <div data-test="squarev2_dummy_form" style={ { display: 'none' } }>
                <div className="form-field">
                    <div className="form-label optimizedCheckout-form-label" id="messageIsDefault" />
                    <div className="form-input optimizedCheckout-form-input" id="inputIsDefault" />
                </div>
                <div className="form-field">
                    <div className="form-input optimizedCheckout-form-input form-input--focus optimizedCheckout-form-input--focus" id="inputIsFocus" />
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
    const copyStylesFromDummyFormFields = () => {
        const styleProps = ['backgroundColor', 'borderColor', 'borderRadius', 'borderWidth', 'color', 'fontSize', 'fontWeight'];

        return {
            default: {
                message: getStylesFromElement('messageIsDefault', [ 'color' ]),
                input: getStylesFromElement('inputIsDefault', styleProps),
            },
            focus: {
                input: getStylesFromElement('inputIsFocus', difference(styleProps, ['borderRadius'])),
            },
            error: {
                message: getStylesFromElement('messageIsError', [ 'color' ]),
                input: getStylesFromElement('inputIsError', [ 'borderColor', 'borderWidth', 'color' ]),
            },
        };
    };
    const mapToSquareStyles = (styles: ReturnType<typeof copyStylesFromDummyFormFields>) => {
        const { borderColor, borderRadius, borderWidth, ...input } = styles.default.input;
        const { borderColor: borderColorIsFocus, borderWidth: borderWidthIsFocus, ...inputIsFocus } = styles.focus.input;
        const { borderColor: borderColorIsError, borderWidth: borderWidthIsError, color: colorIsError } = styles.error.input;

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
            }
        };
    };

    const containerId = 'squarev2_payment_element_container';
    const initializeSquareV2Payment = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                squarev2: {
                    containerId,
                    style: mapToSquareStyles(copyStylesFromDummyFormFields()),
                    onValidationChange,
                },
            }),
        [initializePayment]
    );

    return (
        <>
            { renderDummyFormFields() }
            <HostedWidgetPaymentMethod
                { ...rest }
                containerId={ containerId }
                initializePayment={ initializeSquareV2Payment }
                method={ method }
            />
        </>
    );
};

export default SquareV2PaymentMethod;
