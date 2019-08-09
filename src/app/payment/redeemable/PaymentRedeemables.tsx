import React, { FunctionComponent } from 'react';

import mapToRedeemableProps from '../../cart/mapToRedeemableProps';
import Redeemable, { RedeemableProps } from '../../cart/Redeemable';
import { withCheckout } from '../../checkout';
import { Fieldset } from '../../ui/form';

const PaymentRedeemables: FunctionComponent<RedeemableProps> = redeemableProps => (
    <Fieldset additionalClassName="redeemable-payments">
        <Redeemable
            { ...redeemableProps }
            showAppliedRedeemables={ true }
        />
    </Fieldset>
);

export default withCheckout(mapToRedeemableProps)(PaymentRedeemables);
