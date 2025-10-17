import classNames from 'classnames';
import React, { type FunctionComponent, type ReactNode, useMemo, useState } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import { withFormikExtended } from '../common/form';
import { EMPTY_ARRAY } from '../common/utility';
import { Button, ButtonVariant } from '../ui/button';

import ConsignmentListItem from './ConsignmentListItem';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import { useMultiShippingConsignmentItems } from './hooks/useMultishippingConsignmentItems';
import isSelectedShippingOptionValid from './isSelectedShippingOptionValid';
import MultiShippingFormFooter from './MultiShippingFormFooter';
import { type MultiShippingConsignmentData } from './MultishippingType';
import './MultiShippingForm.scss';
import NewConsignment from './NewConsignment';

export interface MultiShippingFormValues {
    orderComment: string;
}

export interface MultiShippingFormProps {
    cartHasChanged: boolean;
    customerMessage: string;
    defaultCountryCode?: string;
    isLoading: boolean;
    onUnhandledError(error: Error): void;
    onSubmit(values: MultiShippingFormValues): void;
}

const MultiShippingForm: FunctionComponent<MultiShippingFormProps> = ({
    defaultCountryCode,
    isLoading,
    onUnhandledError,
    cartHasChanged,
}: MultiShippingFormProps) => {
    const [errorConsignmentNumber, setErrorConsignmentNumber] = useState<number | undefined>();

    const { themeV2 } = useThemeContext();
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
        return isLoading || !!unassignedLineItems.length || !isEveryConsignmentHasShippingOption || !isSelectedShippingOptionValid(consignments);
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

            if (errorConsignmentIndex === -1) {
                setIsAddShippingDestination(true);

                return;
            }

            setErrorConsignmentNumber(errorConsignmentIndex + 1);
        } else if (isAddShippingDestination) {
            setErrorConsignmentNumber(consignments.length + 1);
        } else {
            setErrorConsignmentNumber(undefined);
            setIsAddShippingDestination(true);
        }
    };

    const hasUnassignedItems = shippableItemsCount > 0;

    const renderAllocatedBanner = (shippableItemsCount: number): ReactNode => {
        if (shippableItemsCount > 0) {
            return <Alert additionalClassName={themeV2 ? 'body-regular' : ''} type={AlertType.Info}>
                <TranslatedString data={{ count: shippableItemsCount }} id="shipping.multishipping_item_to_allocate_message" />
            </Alert>;
        }

        return <Alert additionalClassName={themeV2 ? 'body-regular' : ''} type={AlertType.Success}>
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
                    defaultCountryCode={defaultCountryCode}
                    isLoading={isLoading}
                    onUnhandledError={onUnhandledError}
                    resetErrorConsignmentNumber={resetErrorConsignmentNumber}
                    setIsAddShippingDestination={setIsAddShippingDestination}
                />)
            }
            {hasUnassignedItems &&
                <Button
                    className={classNames({ 'body-regular': themeV2 }, 'add-consignment-button')}
                    onClick={handleAddShippingDestination}
                    variant={ButtonVariant.Secondary}
                >
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
            <MultiShippingFormFooter
                cartHasChanged={cartHasChanged}
                isLoading={isLoading}
                shouldDisableSubmit={shouldDisableSubmit}
                shouldShowOrderComments={shouldShowOrderComments}
            />
        </>
    );
}

export default withLanguage(
    withFormikExtended<MultiShippingFormProps & WithLanguageProps, MultiShippingFormValues>({
        handleSubmit: (values, { props: { onSubmit } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ customerMessage }) => ({
            orderComment: customerMessage,
        }),
        enableReinitialize: true,
    })(MultiShippingForm),
);
