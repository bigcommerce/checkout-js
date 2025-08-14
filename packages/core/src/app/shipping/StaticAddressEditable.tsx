import {
    Address,
    CheckoutSelectors,
    FormField,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { ReactElement, useEffect } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { DynamicFormField, LoadingOverlay } from '@bigcommerce/checkout/ui';

import { StaticAddress } from '../address/';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';
import { Fieldset } from '../ui/form';

import './StaticAddressEditable.scss';

export interface StaticAddressEditableProps {
    address: Address;
    buttonId: string;
    formFields: FormField[];
    isLoading: boolean;
    methodId?: string;
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onFieldChange(fieldName: string, value: string): void;
    onUnhandledError?(error: Error): void;
}

const StaticAddressEditable = ({
    address,
    buttonId,
    formFields,
    isLoading,
    methodId,
    deinitialize,
    initialize,
    onFieldChange,
    onUnhandledError = noop,
}: StaticAddressEditableProps): ReactElement => {
    const handleFieldValueChange = (name: string) => (value: string) => {
        onFieldChange(name, value);
    };
    const customFormFields = formFields.filter(({ custom }) => custom);
    const shouldShowCustomFormFields = customFormFields.length > 0;

    useEffect(() => {
        let isMounted = true;

        initialize({ methodId }).catch((error) => {
            if (isMounted) {
                onUnhandledError(error as Error);
            }
        });

        return () => {
            isMounted = false;
            deinitialize({ methodId }).catch((error) => {
                onUnhandledError(error as Error);
            });
        };
    }, [initialize, deinitialize, methodId, onUnhandledError]);

    return (
        <LoadingOverlay isLoading={isLoading}>
            <div className="stepHeader" style={{ padding: 0 }}>
                <div className="stepHeader-body subheader">
                    <StaticAddress address={address} />
                </div>

                <div className="stepHeader-actions subheader">
                    <Button
                        id={buttonId}
                        onClick={preventDefault()}
                        size={ButtonSize.Tiny}
                        testId="step-edit-button"
                        variant={ButtonVariant.Secondary}
                    >
                        <TranslatedString id="common.edit_action" />
                    </Button>
                </div>
            </div>

            {shouldShowCustomFormFields && (
                <Fieldset id="customFieldset">
                    {customFormFields.map((field) => (
                        <DynamicFormField
                            field={field}
                            key={`${field.id}-${field.name}`}
                            onChange={handleFieldValueChange(field.name)}
                            parentFieldName="shippingAddress.customFields"
                        />
                    ))}
                </Fieldset>
            )}
        </LoadingOverlay>
    );
};

export default StaticAddressEditable;
