import { CheckoutSelectors, Consignment } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

import { StaticAddress } from '../../address';
import { TranslatedString } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';
import getRecommendedShippingOption from '../getRecommendedShippingOption';
import StaticConsignmentItemList from '../StaticConsignmentItemList';

import { ShippingOptionsProps, WithCheckoutShippingOptionsProps } from './ShippingOptions';
import './ShippingOptionsForm.scss';
import ShippingOptionsList from './ShippingOptionsList';

export type ShippingOptionsFormProps = ShippingOptionsProps & WithCheckoutShippingOptionsProps;

class ShippingOptionsForm extends PureComponent<ShippingOptionsFormProps & FormikProps<ShippingOptionsFormValues>> {
    private unsubscribe?: () => void;

    componentDidMount(): void {
        const { subscribeToConsignments } = this.props;
        this.unsubscribe = subscribeToConsignments(this.selectDefaultShippingOptions);
    }

    componentWillUnmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    render(): ReactNode {
        const {
            consignments,
            isMultiShippingMode,
            selectShippingOption,
            isLoading,
            shouldShowShippingOptions,
            invalidShippingMessage,
            methodId,
        } = this.props;

        if (!consignments ||
            !consignments.length ||
            !shouldShowShippingOptions
        ) {
            return (
                <LoadingOverlay isLoading={ isLoading() }>
                    { this.renderNoShippingOptions(
                        <TranslatedString
                            id={ methodId || isMultiShippingMode ?
                                'shipping.select_shipping_address_text' :
                                'shipping.enter_shipping_address_text' }
                        />
                    ) }
                </LoadingOverlay>
            );
        }

        return <>
            { consignments
                .map(consignment => (
                <div className="shippingOptions-container form-fieldset" key={ consignment.id }>
                        { isMultiShippingMode && this.renderConsignment(consignment) }

                        <ShippingOptionsList
                            consignmentId={ consignment.id }
                            inputName={ getRadioInputName(consignment.id) }
                            isLoading={ isLoading(consignment.id) }
                            onSelectedOption={ selectShippingOption }
                            selectedShippingOptionId={ consignment.selectedShippingOption && consignment.selectedShippingOption.id }
                            shippingOptions={ consignment.availableShippingOptions }
                        />

                        { (!consignment.availableShippingOptions || !consignment.availableShippingOptions.length) &&
                            <LoadingOverlay hideContentWhenLoading isLoading={ isLoading(consignment.id) }>
                                { this.renderNoShippingOptions(invalidShippingMessage) }
                            </LoadingOverlay> }
                    </div>
                )) }
        </>;
    }

    private selectDefaultShippingOptions: (state: CheckoutSelectors) => void = async ({ data }) => {
        const { selectShippingOption, setFieldValue } = this.props;

        const consignment = (data.getConsignments() || []).find(({
            selectedShippingOption,
            availableShippingOptions: shippingOptions,
        }) => !selectedShippingOption && shippingOptions);

        if (!consignment || !consignment.availableShippingOptions) {
            return;
        }

        const { availableShippingOptions, id } = consignment;
        const recommendedOption = getRecommendedShippingOption(availableShippingOptions);
        const singleShippingOption = availableShippingOptions.length === 1 && availableShippingOptions[0];
        const defaultShippingOption = recommendedOption || singleShippingOption;

        if (!defaultShippingOption) {
            return;
        }

        await selectShippingOption(id, defaultShippingOption.id);
        setFieldValue(`shippingOptionIds.${id}`, defaultShippingOption.id);
    };

    private renderNoShippingOptions(message: ReactNode): ReactNode {
        return (
            <div className="shippingOptions-panel optimizedCheckout-overlay">
                <p className="shippingOptions-panel-message optimizedCheckout-primaryContent">
                    { message }
                </p>
            </div>
        );
    }

    private renderConsignment(consignment: Consignment): ReactNode {
        const { cart } = this.props;

        return (
            <div className="staticConsignment">
                <strong>
                    <TranslatedString id="shipping.shipping_address_heading" />
                </strong>

                <StaticAddress address={ consignment.shippingAddress } />

                <StaticConsignmentItemList
                    cart={ cart }
                    consignment={ consignment }
                />
            </div>
        );
    }
}

function getRadioInputName(consignmentId: string): string {
    return `shippingOptionIds.${consignmentId}`;
}

export interface ShippingOptionsFormValues {
    shippingOptionIds: {
        [shippingOptionIds: string]: string;
    };
}

export default withFormik<ShippingOptionsFormProps, ShippingOptionsFormValues>({
    handleSubmit: noop,
    mapPropsToValues({ consignments }) {
        const shippingOptionIds: { [id: string]: string } = {};

        (consignments || []).forEach(consignment => {
            shippingOptionIds[consignment.id] = consignment.selectedShippingOption ?
                consignment.selectedShippingOption.id :
                '';
        });

        return { shippingOptionIds };
    },
})(ShippingOptionsForm);
