import { ExtensionRegion } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, memo, useState } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ConfirmationModal } from '@bigcommerce/checkout/ui';

import { Legend } from '../ui/form';
import './ShippingHeader.scss';

interface ShippingHeaderProps {
    isMultiShippingMode: boolean;
    isGuest: boolean;
    shouldShowMultiShipping: boolean;
    onMultiShippingChange(): void;
    isNewMultiShippingUIEnabled: boolean;
}

const ShippingHeader: FunctionComponent<ShippingHeaderProps> = ({
    isMultiShippingMode,
    isGuest,
    onMultiShippingChange,
    shouldShowMultiShipping,
    isNewMultiShippingUIEnabled,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleShipToSingleConfirmation = () => {
        setIsModalOpen(false);
        onMultiShippingChange();
    }

    const showConfirmationModal = shouldShowMultiShipping && isNewMultiShippingUIEnabled && isMultiShippingMode;

    return (
        <>
            <Extension region={ExtensionRegion.ShippingShippingAddressFormBefore} />
            <div className={classNames('form-legend-container', { 'shipping-header': isNewMultiShippingUIEnabled })}>
                <Legend testId="shipping-address-heading">
                    <TranslatedString
                        id={
                            isMultiShippingMode
                                ? isGuest
                                    ? 'shipping.multishipping_address_heading_guest'
                                    : 'shipping.multishipping_address_heading'
                                : 'shipping.shipping_address_heading'
                        }
                    />
                </Legend>

                {showConfirmationModal && (
                    <>
                        <ConfirmationModal
                            action={handleShipToSingleConfirmation}
                            actionButtonLabel={<TranslatedString id="common.proceed_action" />}
                            headerId="shipping.ship_to_single_action"
                            isModalOpen={isModalOpen}
                            messageId="shipping.ship_to_single_message"
                            onRequestClose={() => setIsModalOpen(false)}
                        />
                        <a
                            data-test="shipping-mode-toggle"
                            href="#"
                            onClick={preventDefault(() => setIsModalOpen(true))}
                        >
                            <TranslatedString id="shipping.ship_to_single" />
                        </a>
                    </>
                )}
                {!showConfirmationModal && shouldShowMultiShipping && (
                    <a
                        data-test="shipping-mode-toggle"
                        href="#"
                        onClick={preventDefault(onMultiShippingChange)}
                    >
                        <TranslatedString
                            id={isMultiShippingMode ? 'shipping.ship_to_single' : 'shipping.ship_to_multi'}
                        />
                    </a>
                )}
            </div>
        </>
    );
}

export default memo(ShippingHeader);
