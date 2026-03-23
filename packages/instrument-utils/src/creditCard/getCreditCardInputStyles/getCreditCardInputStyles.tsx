import { noop } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { FormContext, FormFieldContainer, TextInput } from '@bigcommerce/checkout/ui';

export enum CreditCardInputStylesType {
    Default = 'default',
    Error = 'error',
    Focus = 'focus',
}

export default function getCreditCardInputStyles(
    containerId: string,
    properties: string[],
    type: CreditCardInputStylesType = CreditCardInputStylesType.Default,
): Promise<{ [key: string]: string }> {
    const container = document.createElement('div');
    const parentContainer = document.getElementById(containerId);

    if (!parentContainer) {
        return Promise.resolve({});
    }

    parentContainer.appendChild(container);

    return new Promise((resolve) => {
        const callbackRef = (element: HTMLInputElement | null) => {
            if (!element) {
                return;
            }

            resolve(getAppliedStyles(element, properties));

            ReactDOM.unmountComponentAtNode(container);

            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
        };

        ReactDOM.render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: noop }}>
                <FormFieldContainer hasError={type === CreditCardInputStylesType.Error}>
                    <TextInput
                        appearFocused={type === CreditCardInputStylesType.Focus}
                        ref={callbackRef}
                    />
                </FormFieldContainer>
            </FormContext.Provider>,
            container,
        );
    });
}
