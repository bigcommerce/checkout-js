import { type CheckoutSelectors, type Consignment } from '@bigcommerce/checkout-sdk';
import { type FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';

import { useAnalytics } from '@bigcommerce/checkout/analytics';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

import { AddressType, StaticAddress } from '../../address';
import { withFormikExtended } from '../../common/form';
import getRecommendedShippingOption from '../getRecommendedShippingOption';
import StaticConsignmentItemList from '../StaticConsignmentItemList';

import { type ShippingOptionsProps, type WithCheckoutShippingOptionsProps } from './ShippingOptions';
import './ShippingOptionsForm.scss';
import ShippingOptionsList from './ShippingOptionsList';

export type ShippingOptionsFormProps = ShippingOptionsProps &
    WithCheckoutShippingOptionsProps;

const getShippingOptionIds = ({ consignments }: ShippingOptionsFormProps) => {
    const shippingOptionIds: { [id: string]: string } = {};

    (consignments || []).forEach((consignment) => {
        shippingOptionIds[consignment.id] = consignment.selectedShippingOption
            ? consignment.selectedShippingOption.id
            : '';
    });

    return { shippingOptionIds };
};

function getRadioInputName(consignmentId: string): string {
    return `shippingOptionIds.${consignmentId}`;
}

export interface ShippingOptionsFormValues {
    shippingOptionIds: {
        [shippingOptionIds: string]: string;
    };
}

const NoShippingOptions: React.FC<{ message: React.ReactNode }> = ({ message }) => (
    <div className="shippingOptions-panel optimizedCheckout-overlay">
        <p
            aria-live="polite"
            className="shippingOptions-panel-message optimizedCheckout-primaryContent"
            role="alert"
        >
            {message}
        </p>
    </div>
);

const ConsignmentDetails: React.FC<{ cart: any; consignment: Consignment }> = ({ cart, consignment }) => (
    <div className="staticConsignment">
        <strong>
            <TranslatedString id="shipping.shipping_address_heading" />
        </strong>
        <StaticAddress address={consignment.shippingAddress} type={AddressType.Shipping} />
        <StaticConsignmentItemList cart={cart} consignment={consignment} />
    </div>
);

const ShippingOptionsForm: React.FC<
    ShippingOptionsFormProps & FormikProps<ShippingOptionsFormValues>
> = (props) => {
    const {
        consignments,
        cart,
        isMultiShippingMode,
        selectShippingOption,
        isLoading,
        shouldShowShippingOptions,
        invalidShippingMessage,
        methodId,
        subscribeToConsignments,
        setFieldValue,
        shippingFormRenderTimestamp,
        setValues
    } = props;
    const { analyticsTracker } = useAnalytics();
    const unsubscribeRef = useRef<(() => void) | undefined>();

    const selectDefaultShippingOptions = useCallback(
        async ({ data }: CheckoutSelectors) => {
            const consignment = (data.getConsignments() || []).find(
                ({ selectedShippingOption, availableShippingOptions: shippingOptions }) =>
                    !selectedShippingOption && shippingOptions,
            );

            if (!consignment || !consignment.availableShippingOptions) {
                return;
            }

            const { availableShippingOptions, id } = consignment;
            const recommendedOption = getRecommendedShippingOption(availableShippingOptions);
            const singleShippingOption =
                availableShippingOptions.length === 1 && availableShippingOptions[0];
            const defaultShippingOption = recommendedOption || singleShippingOption;

            if (!defaultShippingOption) {
                return;
            }

            await selectShippingOption(id, defaultShippingOption.id);
            setFieldValue(`shippingOptionIds.${id}`, defaultShippingOption.id);
        },
        [selectShippingOption, setFieldValue]
    );

    useEffect(() => {
        unsubscribeRef.current = subscribeToConsignments(selectDefaultShippingOptions);

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = undefined;
            }
        };
    }, [subscribeToConsignments, selectDefaultShippingOptions]);

    useEffect(() => {
        if (consignments?.length && shouldShowShippingOptions) {
            analyticsTracker.showShippingMethods();
        }
    }, [consignments, shouldShowShippingOptions, analyticsTracker]);

    useEffect(() => {
        setValues(getShippingOptionIds(props));
    }, [shippingFormRenderTimestamp, setValues, consignments]);

    if (!consignments?.length || !shouldShowShippingOptions) {
        return (
            <ChecklistSkeleton
                additionalClassName="shippingOptions-skeleton"
                isLoading={isLoading()}
                rows={2}
            >
                <NoShippingOptions
                    message={
                        <TranslatedString
                            id={
                                methodId || isMultiShippingMode
                                    ? 'shipping.select_shipping_address_text'
                                    : 'shipping.enter_shipping_address_text'
                            }
                        />
                    }
                />
            </ChecklistSkeleton>
        );
    }

    return (
        <>
            {consignments.map((consignment) => (
                <div className="shippingOptions-container form-fieldset" key={consignment.id}>
                    {isMultiShippingMode && (
                        <ConsignmentDetails cart={cart} consignment={consignment} />
                    )}

                    <ShippingOptionsList
                        consignmentId={consignment.id}
                        inputName={getRadioInputName(consignment.id)}
                        isLoading={isLoading(consignment.id)}
                        isMultiShippingMode={isMultiShippingMode}
                        onSelectedOption={selectShippingOption}
                        selectedShippingOptionId={
                            consignment.selectedShippingOption &&
                            consignment.selectedShippingOption.id
                        }
                        shippingOptions={consignment.availableShippingOptions}
                    />

                    {(!consignment.availableShippingOptions ||
                        !consignment.availableShippingOptions.length) && (
                        <ChecklistSkeleton
                            additionalClassName="shippingOptions-skeleton"
                            isLoading={isLoading(consignment.id)}
                            rows={2}
                        >
                            <NoShippingOptions message={invalidShippingMessage} />
                        </ChecklistSkeleton>
                    )}
                </div>
            ))}
        </>
    );
};

export default withFormikExtended<ShippingOptionsFormProps, ShippingOptionsFormValues>({
    handleSubmit: noop,
    mapPropsToValues: getShippingOptionIds,
})(ShippingOptionsForm);
