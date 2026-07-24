import { ExtensionRegion } from '@bigcommerce/checkout-sdk/essential';
import classNames from 'classnames';
import React, { type FunctionComponent, memo, useEffect, useMemo, useState } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ConfirmationModal, Legend } from '@bigcommerce/checkout/ui';

import { useSetCheckoutStepHeaderAction } from '../checkout/CheckoutStepHeaderActionContext';

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
    const { themeV2 } = useThemeContext();
    const setHeaderAction = useSetCheckoutStepHeaderAction();

    const isSubheaderHidden = themeV2 && !isMultiShippingMode;

    const handleShipToSingleConfirmation = () => {
        setIsSingleShippingConfirmationModalOpen(false);
        onMultiShippingChange();
    };

    const showConfirmationModal = shouldShowMultiShipping && isMultiShippingMode;
    const showMultiShippingUnavailableModal =
        shouldShowMultiShipping && !isMultiShippingMode && cartHasPromotionalItems;

    const modeToggleLink = useMemo(() => {
        if (showConfirmationModal) {
            return (
                <a
                    className="body-cta"
                    data-test="shipping-mode-toggle"
                    href="#"
                    onClick={preventDefault(() => setIsSingleShippingConfirmationModalOpen(true))}
                >
                    <TranslatedString id="shipping.ship_to_single" />
                </a>
            );
        }

        if (showMultiShippingUnavailableModal) {
            return (
                <a
                    className="body-cta"
                    data-test="shipping-mode-toggle"
                    href="#"
                    onClick={preventDefault(() => setIsMultiShippingUnavailableModalOpen(true))}
                >
                    <TranslatedString id="shipping.ship_to_multi" />
                </a>
            );
        }

        if (shouldShowMultiShipping) {
            return (
                <a
                    className="body-cta"
                    data-test="shipping-mode-toggle"
                    href="#"
                    onClick={preventDefault(onMultiShippingChange)}
                >
                    <TranslatedString
                        id={
                            isMultiShippingMode
                                ? 'shipping.ship_to_single'
                                : 'shipping.ship_to_multi'
                        }
                    />
                </a>
            );
        }

        return null;
    }, [
        showConfirmationModal,
        showMultiShippingUnavailableModal,
        shouldShowMultiShipping,
        isMultiShippingMode,
        onMultiShippingChange,
    ]);

    useEffect(() => {
        if (!themeV2) {
            setHeaderAction(null);

            return;
        }

        setHeaderAction(modeToggleLink);

        return () => setHeaderAction(null);
    }, [themeV2, modeToggleLink, setHeaderAction]);

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

                {!themeV2 && modeToggleLink}
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
