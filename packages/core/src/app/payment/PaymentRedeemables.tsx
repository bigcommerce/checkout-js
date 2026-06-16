import React, { type FunctionComponent, memo } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Fieldset, Legend } from '@bigcommerce/checkout/ui';

import { mapToRedeemableProps, Redeemable, type RedeemableProps } from '../cart';
import { withCheckout } from '../checkout';
import { isExperimentEnabled } from '../common/utility';

const PaymentRedeemables: FunctionComponent<RedeemableProps> = (redeemableProps) => {
    const { selectedState: config } = useCheckout(({ data }) => data.getConfig());
    const { checkoutSettings } = config ?? {};
    const isMultiCouponEnabled = isExperimentEnabled(
        checkoutSettings,
        'CHECKOUT-9674.multi_coupon_cart_checkout',
        false,
    );

    const {
        userJourney: { disableCoupon, disableGiftCertificate },
    } = useCapabilities();

    return (
        <Fieldset
            additionalClassName="redeemable-payments"
            legend={
                <Legend hidden>
                    <TranslatedString id="payment.redeemable_payments_text" />
                </Legend>
            }
        >
            <Redeemable
                {...redeemableProps}
                disableCoupon={disableCoupon}
                disableGiftCertificate={disableGiftCertificate}
                showAppliedRedeemables={!isMultiCouponEnabled}
            />
        </Fieldset>
    );
};

export default withCheckout(mapToRedeemableProps)(memo(PaymentRedeemables));
