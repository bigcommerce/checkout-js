import { CheckoutSelectors, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

import { DynamicFormField, Fieldset } from '../ui/form';

export interface RemoteShippingAddressProps {
    containerId: string;
    methodId: string;
    formFields: FormField[];
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
    onFieldChange(fieldName: string, value: string): void;
}

class RemoteShippingAddress extends PureComponent<RemoteShippingAddressProps> {
    async componentDidMount(): Promise<void> {
        const {
            initialize,
            methodId,
            onUnhandledError = noop,
        } = this.props;

        try {
            await initialize({ methodId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitialize,
            methodId,
            onUnhandledError = noop,
        } = this.props;

        try {
            await deinitialize({ methodId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const {
            containerId,
            formFields,
            methodId,
        } = this.props;

        return (
            <>
                <div
                    className={ `widget address-widget widget--${methodId}` }
                    id={ containerId }
                    tabIndex={ -1 }
                />
                <Fieldset>
                {
                    formFields.filter(({ custom }) => custom).map(field => (
                        <DynamicFormField
                            field={ field }
                            key={ `${field.id}-${field.name}` }
                            onChange={ this.handleFieldValueChange(field.name) }
                            parentFieldName="shippingAddress.customFields"
                        />
                    ))
                }
                </Fieldset>
            </>
        );
    }

    private handleFieldValueChange: (name: string) => (value: string) => void = name => value => {
        const { onFieldChange } = this.props;
        onFieldChange(name, value);
    };
}

export default RemoteShippingAddress;
