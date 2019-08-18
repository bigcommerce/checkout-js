import { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { TranslatedString } from '../../language';
import { LoadingOverlay } from '../../ui/loading';
import getRecommendedShippingOption from '../util/getRecommendedShippingOption';
import StaticConsignment from '../StaticConsignment';

import { ShippingOptionsProps, WithCheckoutShippingOptionsProps } from './ShippingOptions';
import ShippingOptionsList from './ShippingOptionsList';

export type ShippingOptionsFormProps = ShippingOptionsProps & WithCheckoutShippingOptionsProps;

class ShippingOptionsForm extends Component<ShippingOptionsFormProps & FormikProps<ShippingOptionsFormValues>> {
    private unsubscribe?: () => void;

    componentDidMount(): void {
        const { subscribeToConsignments } = this.props;

        this.unsubscribe = subscribeToConsignments(this.selectDefaultShippingOption);
    }

    componentWillUnmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    render(): ReactNode {
        const {
            cart,
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
                <LoadingOverlay isLoading={ isLoading() } >
                    { this.renderNoShippingOptions(
                        <TranslatedString
                            id={ methodId || isMultiShippingMode ?
                                'shipping.select_shipping_address_text' :
                                'shipping.enter_shipping_address_text'
                            }
                        />)
                    }
                </LoadingOverlay>
            );
        }

        return (
            <Fragment> { consignments
                .slice(0, isMultiShippingMode ? undefined : 1)
                .sort((a, b) => (a.id > b.id ? -1 : 1))
                .map(consignment => (
                    <div className="shippingOptions-container form-fieldset" key={ consignment.id }>
                        { isMultiShippingMode &&
                            <StaticConsignment cart={ cart } consignment={ consignment } />
                        }

                        <ShippingOptionsList
                            inputName={ getRadioInputName(consignment.id) }
                            consignmentId={ consignment.id }
                            shippingOptions={ consignment.availableShippingOptions }
                            isLoading={ isLoading(consignment.id) }
                            selectedShippingOptionId={ consignment.selectedShippingOption && consignment.selectedShippingOption.id }
                            onSelectedOption={ selectShippingOption }
                        />

                        { (!consignment.availableShippingOptions || !consignment.availableShippingOptions.length) &&
                            <LoadingOverlay isLoading={ isLoading(consignment.id) } hideContentWhenLoading>
                                { this.renderNoShippingOptions(invalidShippingMessage) }
                            </LoadingOverlay>
                        }
                    </div>
                ))
            } </Fragment>
        );
    }

    private selectDefaultShippingOption: (state: CheckoutSelectors) => void = ({ data }) => {
        const {
            selectShippingOption,
            isSelectingShippingOption,
        } = this.props;

        (data.getConsignments() || []).map(consignment => {
            const {
                id,
                selectedShippingOption,
            } = consignment;

            if (selectedShippingOption || isSelectingShippingOption(consignment.id)) {
                return;
            }

            const recommendedOption = getRecommendedShippingOption(consignment);
            const defaultShippingOption = recommendedOption || (
                consignment.availableShippingOptions &&
                consignment.availableShippingOptions.length === 1 ?
                    consignment.availableShippingOptions[0] :
                    undefined
                );

            if (!defaultShippingOption) {
                return;
            }

            return selectShippingOption(id, defaultShippingOption.id);
        });
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
    enableReinitialize: true,
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
