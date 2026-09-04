import React, { type FunctionComponent, memo } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Fieldset, Legend, MobileView } from '@bigcommerce/checkout/ui';
import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

import { mapToRedeemableProps, Redeemable, type RedeemableProps } from '../cart';
import { withCheckout } from '../checkout';
import { CollapsibleCouponForm } from '../coupon/components';

const PaymentRedeemables: FunctionComponent<RedeemableProps> = (redeemableProps) => {
    const {
        userJourney: { disableCoupon, disableGiftCertificate },
    } = useCapabilities();

    const { selectedState: config } = useCheckout(({ data }) => data.getConfig());
    const isUnifiedCouponFormEnabled = isExperimentEnabled(
        config?.checkoutSettings,
        'CHECKOUT-10307.unified_payment_coupon_form',
        false,
    );

    const legend = (
        <Legend hidden>
            <TranslatedString id="payment.redeemable_payments_text" />
        </Legend>
    );

    if (!isUnifiedCouponFormEnabled) {
        return (
            <Fieldset additionalClassName="redeemable-payments" legend={legend}>
                <Redeemable
                    {...redeemableProps}
                    disableCoupon={disableCoupon}
                    disableGiftCertificate={disableGiftCertificate}
                />
            </Fieldset>
        );
    }

    if (disableCoupon && disableGiftCertificate) {
        return null;
    }

    return (
        <MobileView>
            {(matched) =>
                matched && (
                    <Fieldset additionalClassName="redeemable-payments" legend={legend}>
                        <CollapsibleCouponForm formInstanceId="payment-" />
                    </Fieldset>
                )
            }
        </MobileView>
    );
};

export default withCheckout(mapToRedeemableProps)(memo(PaymentRedeemables));
