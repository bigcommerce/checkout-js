import { noop } from 'lodash';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { FormContext } from '@bigcommerce/checkout/ui';

import { FormFieldContainer, TextInput } from '../../ui/form';

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
        throw new Error(
            'Unable to retrieve input styles as the provided container ID is not valid.',
        );
    }

    parentContainer.appendChild(container);

    return new Promise((resolve) => {
        const root = createRoot(container);

        const callbackRef = (element: HTMLInputElement | null) => {
            if (!element) {
                return;
            }

            resolve(getAppliedStyles(element, properties));

            // Defer cleanup so we don't unmount during React's commit phase,
            // which would happen if this function is called from a lifecycle method.
            queueMicrotask(() => {
                root.unmount();

                if (container.parentElement) {
                    container.parentElement.removeChild(container);
                }
            });
        };

        root.render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: noop }}>
                <FormFieldContainer hasError={type === CreditCardInputStylesType.Error}>
                    <TextInput
                        appearFocused={type === CreditCardInputStylesType.Focus}
                        ref={callbackRef}
                    />
                </FormFieldContainer>
            </FormContext.Provider>,
        );
    });
}
