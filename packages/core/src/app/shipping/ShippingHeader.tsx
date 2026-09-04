import { ExtensionRegion } from '@bigcommerce/checkout-sdk/essential';
import classNames from 'classnames';
import React, { type FunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useSetCheckoutStepHeaderAction, useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ConfirmationModal, Legend } from '@bigcommerce/checkout/ui';

import './ShippingHeader.scss';

interface ShippingHeaderProps {
    isMultiShippingMode: boolean;
    shouldShowMultiShipping: boolean;
    onMultiShippingChange(): void;
    cartHasPromotionalItems?: boolean;
}

const ShippingHeader: FunctionComponent<ShippingHeaderProps> = ({
    isMultiShippingMode,
    onMultiShippingChange,
    shouldShowMultiShipping,
    cartHasPromotionalItems,
}) => {
    const [isSingleShippingConfirmationModalOpen, setIsSingleShippingConfirmationModalOpen] =
        useState(false);
    const [isMultiShippingUnavailableModalOpen, setIsMultiShippingUnavailableModalOpen] =
        useState(false);
    const { enhancedThemeV1 } = useThemeContext();
    const setHeaderAction = useSetCheckoutStepHeaderAction();

    const isSubheaderHidden = enhancedThemeV1 && !isMultiShippingMode;

    const handleShipToSingleConfirmation = () => {
        setIsSingleShippingConfirmationModalOpen(false);
        onMultiShippingChange();
    };

    const showConfirmationModal = shouldShowMultiShipping && isMultiShippingMode;
    const showMultiShippingUnavailableModal =
        shouldShowMultiShipping && !isMultiShippingMode && cartHasPromotionalItems;

    const modeToggleLink = useMemo(() => {
        if (!shouldShowMultiShipping) {
            return null;
        }

        const getHandleClick = () => {
            if (showConfirmationModal) {
                return () => setIsSingleShippingConfirmationModalOpen(true);
            }

            if (showMultiShippingUnavailableModal) {
                return () => setIsMultiShippingUnavailableModalOpen(true);
            }

            return onMultiShippingChange;
        };

        const handleClick = getHandleClick();

        return (
            <a
                className="body-cta"
                data-test="shipping-mode-toggle"
                href="#"
                onClick={preventDefault(handleClick)}
            >
                <TranslatedString
                    id={isMultiShippingMode ? 'shipping.ship_to_single' : 'shipping.ship_to_multi'}
                />
            </a>
        );
    }, [
        showConfirmationModal,
        showMultiShippingUnavailableModal,
        shouldShowMultiShipping,
        isMultiShippingMode,
        onMultiShippingChange,
    ]);

    useEffect(() => {
        if (!enhancedThemeV1) {
            setHeaderAction(null);

            return;
        }

        setHeaderAction(modeToggleLink);

        return () => setHeaderAction(null);
    }, [enhancedThemeV1, modeToggleLink, setHeaderAction]);

    return (
        <>
            <Extension region={ExtensionRegion.ShippingShippingAddressFormBefore} />
            <div className={classNames(['form-legend-container', 'shipping-header'])}>
                <Legend hidden={isSubheaderHidden} testId="shipping-address-heading">
                    <TranslatedString
                        id={
                            isMultiShippingMode
                                ? 'shipping.multishipping_address_heading'
                                : 'shipping.shipping_address_heading'
                        }
                    />
                </Legend>

                {!enhancedThemeV1 && modeToggleLink}
            </div>

            {showConfirmationModal && (
                <ConfirmationModal
                    action={handleShipToSingleConfirmation}
                    actionButtonLabel={<TranslatedString id="common.proceed_action" />}
                    headerId="shipping.ship_to_single_action"
                    isModalOpen={isSingleShippingConfirmationModalOpen}
                    messageId="shipping.ship_to_single_message"
                    onRequestClose={() => setIsSingleShippingConfirmationModalOpen(false)}
                />
            )}
            {showMultiShippingUnavailableModal && (
                <ConfirmationModal
                    action={() => setIsMultiShippingUnavailableModalOpen(false)}
                    actionButtonLabel={<TranslatedString id="common.back_action" />}
                    headerId="shipping.multishipping_unavailable_action"
                    isModalOpen={isMultiShippingUnavailableModalOpen}
                    messageId="shipping.multishipping_unavailable_message"
                    onRequestClose={() => setIsMultiShippingUnavailableModalOpen(false)}
                />
            )}
        </>
    );
};

export default memo(ShippingHeader);
