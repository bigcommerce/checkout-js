import React, { FunctionComponent, useMemo, useState } from 'react';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import { withFormikExtended } from '../common/form';
import { EMPTY_ARRAY } from '../common/utility';
import { Button, ButtonVariant } from '../ui/button';

import ConsignmentListItem from './ConsignmentListItem';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import { useMultiShippingConsignmentItems } from './hooks/useMultishippingConsignmentItems';
import MultiShippingFormV2Footer from './MultiShippingFormV2Footer';
import { MultiShippingConsignmentData } from './MultishippingV2Type';
import './MultiShippingFormV2.scss';
import NewConsignment from './NewConsignment';

interface MultiShippingFormV2Values {
    orderComment: string;
}

export interface MultiShippingFormV2Props {
    cartHasChanged: boolean;
    customerMessage: string;
    defaultCountryCode?: string;
    countriesWithAutocomplete: string[];
    isLoading: boolean;
    onUnhandledError(error: Error): void;
    onSubmit(values: MultiShippingFormV2Values): void;
}

const MultiShippingFormV2: FunctionComponent<MultiShippingFormV2Props> = ({
                                                                              countriesWithAutocomplete,
                                                                              defaultCountryCode,
                                                                              isLoading,
                                                                              onUnhandledError,
                                                                              cartHasChanged,
                                                                          }: MultiShippingFormV2Props) => {
    const [errorConsignmentNumber, setErrorConsignmentNumber] = useState<number | undefined>();

    const {
        checkoutState: {
            data: { getConsignments, getConfig },
        },
    } = useCheckout();
    const { unassignedItems: { lineItems: unassignedLineItems, shippableItemsCount }, consignmentList } = useMultiShippingConsignmentItems();

    const consignments = getConsignments() || EMPTY_ARRAY;
    const config = getConfig();

    const [isAddShippingDestination, setIsAddShippingDestination] = useState(
        consignments.length === 0,
    );

    const isEveryConsignmentHasShippingOption = hasSelectedShippingOptions(consignments);
    const shouldDisableSubmit = useMemo(() => {
        return isLoading || !!unassignedLineItems.length || !isEveryConsignmentHasShippingOption;
    }, [isLoading, consignments]);

    if (!config) {
        return null;
    }

    const {
        checkoutSettings: {
            enableOrderComments: shouldShowOrderComments,
            shippingQuoteFailedMessage,
        },
    } = config;

    const handleAddShippingDestination = () => {
        if (!isAddShippingDestination && !isEveryConsignmentHasShippingOption) {
            const errorConsignmentIndex = consignments.findIndex(
                (consignment) => !consignment.selectedShippingOption,
            );

            setErrorConsignmentNumber(errorConsignmentIndex + 1);
        } else if (isAddShippingDestination) {
            setErrorConsignmentNumber(consignments.length + 1);
        } else {
            setErrorConsignmentNumber(undefined);
            setIsAddShippingDestination(true);
        }
    };

    const hasUnassignedItems = shippableItemsCount > 0;

    const renderAllocatedBanner = (shippableItemsCount: number): React.JSX.Element  => {
        if (shippableItemsCount > 0) {
            return <Alert type={AlertType.Info}>
                <TranslatedString data={{ count: shippableItemsCount }} id="shipping.multishipping_item_to_allocate_message" />
            </Alert>;
        }

        return <Alert type={AlertType.Success}>
            <TranslatedString id="shipping.multishipping_all_items_allocated_message" />
        </Alert>;
    }
    const resetErrorConsignmentNumber = () => {
        setErrorConsignmentNumber(undefined);
    };

    return (
        <>
            {renderAllocatedBanner(shippableItemsCount)}
            {consignmentList.map((consignment: MultiShippingConsignmentData) => (
                <ConsignmentListItem
                    consignment={consignment}
                    consignmentNumber={consignment.consignmentNumber}
                    countriesWithAutocomplete={countriesWithAutocomplete}
                    defaultCountryCode={defaultCountryCode}
                    isLoading={isLoading}
                    key={consignment.id}
                    onUnhandledError={onUnhandledError}
                    resetErrorConsignmentNumber={resetErrorConsignmentNumber}
                    shippingQuoteFailedMessage={shippingQuoteFailedMessage}
                />
            ))}
            {isAddShippingDestination && (
                <NewConsignment
                    consignmentNumber={consignments.length === 0 ? 1 : (consignments.length + 1)}
                    countriesWithAutocomplete={countriesWithAutocomplete}
                    defaultCountryCode={defaultCountryCode}
                    isLoading={isLoading}
                    onUnhandledError={onUnhandledError}
                    resetErrorConsignmentNumber={resetErrorConsignmentNumber}
                    setIsAddShippingDestination={setIsAddShippingDestination}
                />)
            }
            {hasUnassignedItems &&
                <Button className='add-consignment-button' onClick={handleAddShippingDestination} variant={ButtonVariant.Secondary}>
                    <TranslatedString id="shipping.multishipping_add_new_destination" />
                </Button>
            }
            {Boolean(errorConsignmentNumber) && (
                <div className="form-field--error">
                    <span className="form-inlineMessage">
                        <TranslatedString
                            data={{ consignmentNumber: errorConsignmentNumber }}
                            id="shipping.multishipping_incomplete_consignment_error"
                        />
                    </span>
                </div>
            )}
            <MultiShippingFormV2Footer
                cartHasChanged={cartHasChanged}
                isLoading={isLoading}
                shouldDisableSubmit={shouldDisableSubmit}
                shouldShowOrderComments={shouldShowOrderComments}
            />
        </>
    );
}

export default withLanguage(
    withFormikExtended<MultiShippingFormV2Props & WithLanguageProps, MultiShippingFormV2Values>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ customerMessage }) => ({
            orderComment: customerMessage,
        }),
        enableReinitialize: true,
    })(MultiShippingFormV2),
);
