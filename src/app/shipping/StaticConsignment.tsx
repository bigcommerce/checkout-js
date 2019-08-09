import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { StaticAddress } from '../address';
import { TranslatedString } from '../language';

import StaticShippingOption from './shippingOption/StaticShippingOption';
import findLineItems from './util/findLineItems';
import getLineItemsCount from './util/getLineItemsCount';
import './StaticConsignment.scss';

interface StaticConsignmentProps {
    consignment: Consignment;
    cart: Cart;
    compactView?: boolean;
    showShippingMethod?: boolean;
}

const StaticConsignment: React.SFC<StaticConsignmentProps> = ({
    consignment,
    cart,
    showShippingMethod,
    compactView,
}) => {
    const lineItems = findLineItems(cart, consignment);
    const {
        shippingAddress: address,
        selectedShippingOption,
    } = consignment;

    return (
        <div className="staticConsignment">
            { !compactView &&
                <strong>
                    <TranslatedString id="shipping.shipping_address_heading" />
                </strong>
            }
            <StaticAddress address={ address } />
            { !compactView &&
                <div className="staticConsignment-items">
                    <strong>
                        <TranslatedString id="cart.item_count_text"
                            data={ { count: getLineItemsCount(lineItems) } } />
                    </strong>
                    <ul>
                        { lineItems.map(item =>
                            <li key={ item.id }>
                                { item.quantity } x { item.name }
                            </li>
                        ) }
                    </ul>
                </div>
            }

            { showShippingMethod && selectedShippingOption &&
                <div>
                    { !compactView &&
                        <strong>
                            <TranslatedString id="shipping.shipping_method_label"/>
                        </strong>
                    }
                    <div className="shippingOption shippingOption--alt">
                        <StaticShippingOption method={ selectedShippingOption } />
                    </div>
                </div>
            }
        </div>
    );
};

export default StaticConsignment;
