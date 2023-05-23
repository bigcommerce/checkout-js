import CheckoutButton from "./CheckoutButton";
import { AmazonPayV2Button, ApplePayButton, PayPalCommerceButton } from "./customWalletButton";

const CheckoutButtonV1Resolver = (methodId: string) => {
    switch (methodId) {
        case 'applepay':
            return ApplePayButton;

        case 'amazonpay':
            return AmazonPayV2Button;

        case 'paypalcommerce':
        case 'paypalcommercecredit':
            return PayPalCommerceButton;
    }

    return CheckoutButton;
};

export default CheckoutButtonV1Resolver;