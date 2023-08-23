import {
    Address,
    CheckoutSelectors,
    FormField,
    ShippingInitializeOptions,
    ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { StaticAddress } from '../address/';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';
import { DynamicFormField, Fieldset } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

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

class StaticAddressEditable extends PureComponent<StaticAddressEditableProps> {
    async componentDidMount(): Promise<void> {
        const { initialize, methodId, onUnhandledError = noop } = this.props;

        try {
            await initialize({ methodId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const { deinitialize, methodId, onUnhandledError = noop } = this.props;

        try {
            await deinitialize({ methodId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const { address, buttonId, formFields, isLoading } = this.props;

        const customFormFields = formFields.filter(({ custom }) => custom);
        const shouldShowCustomFormFields = customFormFields.length > 0;

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
                                onChange={this.handleFieldValueChange(field.name)}
                                parentFieldName="shippingAddress.customFields"
                            />
                        ))}
                    </Fieldset>
                )}
            </LoadingOverlay>
        );
    }

    private handleFieldValueChange: (name: string) => (value: string) => void =
        (name) => (value) => {
            const { onFieldChange } = this.props;

            onFieldChange(name, value);
        };
}

export default StaticAddressEditable;
