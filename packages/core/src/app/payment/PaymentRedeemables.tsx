import React, { type FunctionComponent, memo } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { mapToRedeemableProps, Redeemable, type RedeemableProps } from '../cart';
import { withCheckout } from '../checkout';
import { isExperimentEnabled } from '../common/utility';
import { Fieldset, Legend } from '../ui/form';

const PaymentRedeemables: FunctionComponent<RedeemableProps> = (redeemableProps) => {
    const { checkoutState } = useCheckout();
    const { checkoutSettings } = checkoutState.data.getConfig() ?? {};
    const isMultiCouponEnabled = isExperimentEnabled(checkoutSettings, 'CHECKOUT-9674.multi_coupon_cart_checkout', false);

    return (
        <Fieldset 
            additionalClassName="redeemable-payments"
            legend={
                <Legend hidden>
                    <TranslatedString id="payment.redeemable_payments_text" />
                </Legend>
            }
        >
            <Redeemable {...redeemableProps} showAppliedRedeemables={!isMultiCouponEnabled} />
        </Fieldset>
    );
};

export default withCheckout(mapToRedeemableProps)(memo(PaymentRedeemables));
