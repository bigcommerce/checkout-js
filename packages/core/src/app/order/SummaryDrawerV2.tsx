import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, type KeyboardEvent, type ReactNode, useState } from 'react';
import ReactModal from 'react-modal';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconChevronDown, IconChevronUp } from '@bigcommerce/checkout/ui';

import { CartOutstandingBalance } from '../cart/CartOutstandingBalance';
import { CartSummaryItemImage } from '../cart/CartSummaryItemImage';
import { useSheetDismissDrag } from '../cart/useSheetDismissDrag';

import getItemsCount from './getItemsCount';
import getLineItemsCount from './getLineItemsCount';

const SHEET_TRANSITION_DURATION = 600;

export interface SummaryDrawerV2Props {
    nonBundledItems: LineItemMap;
    amount: number;
    currencyCode: string;
    children: ReactNode;
}

export const SummaryDrawerV2: FunctionComponent<SummaryDrawerV2Props> = ({
    nonBundledItems,
    amount,
    currencyCode,
    children,
}) => {
    const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const closeSheet = () => {
        setIsExpanded(false);
    };

    const { setSheetElement, handleProps: sheetHandleProps } = useSheetDismissDrag(
        isExpanded,
        closeSheet,
    );

    const { language } = useLocale();
    const cartHeading = language.translate('cart.cart_heading');

    const toggleSheet = () => {
        setIsExpanded((currentState) => !currentState);
    };

    const handleBarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSheet();
        }
    };

    return (
        <div className="cart-summary-drawer enhancedThemeV1" ref={setRootElement}>
            <div
                aria-controls="cart-summary-sheet"
                aria-expanded={isExpanded}
                className="cart-summary-collapsed-bar optimizedCheckout-orderSummary"
                data-test="cart-summary-collapsed-bar"
                onClick={toggleSheet}
                onKeyDown={handleBarKeyDown}
                role="button"
                tabIndex={0}
            >
                <figure
                    className={classNames('cart-summary-figure', {
                        'cart-summary-figure--stack': getLineItemsCount(nonBundledItems) > 1,
                    })}
                    data-test="cart-summary-figure"
                >
                    <div className="cart-summary-image-wrapper">
                        <CartSummaryItemImage lineItems={nonBundledItems} />
                    </div>
                </figure>
                <div className="cart-summary-bar-body">
                    <span className="body-regular" data-test="cart-item-count">
                        <TranslatedString
                            data={{ count: getItemsCount(nonBundledItems) }}
                            id="cart.item_count_text"
                        />
                    </span>
                    <CartOutstandingBalance amount={amount} currencyCode={currencyCode} />
                </div>
                <span className="cart-summary-bar-toggle-label body-regular optimizedCheckout-orderSummary-toggle">
                    <TranslatedString
                        id={isExpanded ? 'cart.hide_details_action' : 'cart.show_details_action'}
                    />
                    {isExpanded ? <IconChevronDown /> : <IconChevronUp />}
                </span>
            </div>
            {rootElement && (
                <ReactModal
                    ariaHideApp={false}
                    bodyOpenClassName="has-activeCartSummarySheet"
                    className={{
                        base: 'cart-summary-sheet optimizedCheckout-orderSummary',
                        afterOpen: 'cart-summary-sheet--afterOpen',
                        beforeClose: 'cart-summary-sheet--beforeClose',
                    }}
                    closeTimeoutMS={SHEET_TRANSITION_DURATION}
                    contentElement={(contentProps, contentChildren) => (
                        <div {...contentProps} data-test="cart-summary-sheet">
                            {contentChildren}
                        </div>
                    )}
                    contentLabel={cartHeading}
                    contentRef={setSheetElement}
                    id="cart-summary-sheet"
                    isOpen={isExpanded}
                    onRequestClose={closeSheet}
                    overlayClassName={{
                        base: 'cart-summary-backdrop',
                        afterOpen: 'cart-summary-backdrop--afterOpen',
                        beforeClose: 'cart-summary-backdrop--beforeClose',
                    }}
                    overlayElement={(overlayProps, contentElement) => (
                        <div {...overlayProps} data-test="cart-summary-backdrop">
                            {contentElement}
                        </div>
                    )}
                    parentSelector={() => rootElement}
                >
                    <div
                        className="cart-summary-sheet-handle-region"
                        data-test="cart-summary-sheet-handle"
                        {...sheetHandleProps}
                    >
                        <div className="cart-summary-sheet-handle" />
                    </div>
                    <div className="cart-summary-sheet-content">{children}</div>
                </ReactModal>
            )}
        </div>
    );
};
