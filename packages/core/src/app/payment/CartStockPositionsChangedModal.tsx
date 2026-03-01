import { type Cart, type Consignment } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { ButtonVariant } from '@bigcommerce/checkout/ui';

import { Button } from '../ui/button';
import { Modal, ModalHeader } from '../ui/modal';

import CartStockPositionsChangedItemList from './CartStockPositionsChangedItemList';
import CartStockPositionsChangedMultiConsignmentContent from './CartStockPositionsChangedMultiConsignmentContent';
import {
    getChangedItemsToShow,
    groupChangedItemsByConsignment,
} from './cartStockPositionsChangedUtils';

export interface CartStockPositionsChangedModalProps {
    cart?: Cart;
    changedLineItemIds?: Array<string | number>;
    consignments?: Consignment[];
    isOpen: boolean;
    onPlaceOrder(): void;
    onRequestClose(): void;
}

const CartStockPositionsChangedModal: FunctionComponent<CartStockPositionsChangedModalProps> = ({
    cart,
    changedLineItemIds,
    consignments,
    isOpen,
    onPlaceOrder,
    onRequestClose,
}) => {
    const { themeV2 } = useThemeContext();

    const changedItemsToShow = useMemo(
        () => getChangedItemsToShow(cart, changedLineItemIds),
        [cart, changedLineItemIds],
    );

    const groupedByConsignment = useMemo(
        () => groupChangedItemsByConsignment(cart, consignments, changedItemsToShow),
        [cart, consignments, changedItemsToShow],
    );

    const modalContent = groupedByConsignment ? (
        <CartStockPositionsChangedMultiConsignmentContent consignmentGroups={groupedByConsignment} />
    ) : (
        <CartStockPositionsChangedItemList items={changedItemsToShow} />
    );

    return (
        <Modal
            additionalModalClassName={classNames('cart-stock-positions-changed-modal', {
                themeV2,
            })}
            footer={
                <>
                    <Button
                        className="body-medium"
                        onClick={onRequestClose}
                        variant={ButtonVariant.Secondary}
                    >
                        <TranslatedString id="common.back_action" />
                    </Button>
                    <Button
                        className="body-medium"
                        onClick={onPlaceOrder}
                        variant={ButtonVariant.Primary}
                    >
                        <TranslatedString id="payment.place_order_action" />
                    </Button>
                </>
            }
            header={
                <ModalHeader additionalClassName="header">
                    <TranslatedString id="cart.backorder_quantities_changed_heading" />
                </ModalHeader>
            }
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
            {modalContent}
        </Modal>
    );
};

export default CartStockPositionsChangedModal;
