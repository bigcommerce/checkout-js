import React, { type FunctionComponent } from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedLink, TranslatedString } from "@bigcommerce/checkout/locale";

interface MultiShippingGuestFormProps {
    onSignIn(): void;
    onCreateAccount(): void;
}

const MultiShippingGuestForm: FunctionComponent<MultiShippingGuestFormProps> = ({
    onSignIn,
    onCreateAccount
}: MultiShippingGuestFormProps) => {
    return (
        <div className="checkout-step-info">
            <TranslatedString id="shipping.multishipping_guest_intro" />{' '}
            <a
                data-test="shipping-sign-in-link"
                href="#"
                onClick={preventDefault(onSignIn)}
            >
                <TranslatedString id="shipping.multishipping_guest_sign_in" />
            </a>{' '}
            <TranslatedLink
                id="shipping.multishipping_guest_create"
                onClick={onCreateAccount}
            />
        </div>
    )
};

export default MultiShippingGuestForm;
