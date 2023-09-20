import {
    Cart,
} from '@bigcommerce/checkout-sdk';

export default function isSubsciptionSelected (cart: Cart | undefined) {
    const lineItems = cart?.lineItems;
    if(lineItems){
      const items = [
        ...lineItems.physicalItems,
        ...lineItems.digitalItems,
    ];

    return items.some(item => {
        if (item.options) {
            return item.options.some(option => option.name === "Ships Every" && option.value);
        }
        return false;
    });
    }

    return false;
}
