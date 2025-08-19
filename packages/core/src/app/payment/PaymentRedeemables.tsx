import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { mapToRedeemableProps, Redeemable, type RedeemableProps } from '../cart';
import { withCheckout } from '../checkout';
import { Fieldset, Legend } from '../ui/form';

const PaymentRedeemables: FunctionComponent<RedeemableProps> = (redeemableProps) => (
    <Fieldset 
        additionalClassName="redeemable-payments"
        legend={
            <Legend hidden>
                <TranslatedString id="payment.redeemable_payments_text" />
            </Legend>
        }
    >
        <Redeemable {...redeemableProps} showAppliedRedeemables={true} />
    </Fieldset>
);

export default withCheckout(mapToRedeemableProps)(memo(PaymentRedeemables));
