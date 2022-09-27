import React, { FunctionComponent, memo } from 'react';

import { mapToRedeemableProps, Redeemable, RedeemableProps } from '../cart';
import { withCheckout } from '../checkout';
import { Fieldset } from '../ui/form';

const PaymentRedeemables: FunctionComponent<RedeemableProps> = (redeemableProps) => (
    <Fieldset additionalClassName="redeemable-payments">
        <Redeemable {...redeemableProps} showAppliedRedeemables={true} />
    </Fieldset>
);

export default withCheckout(mapToRedeemableProps)(memo(PaymentRedeemables));
