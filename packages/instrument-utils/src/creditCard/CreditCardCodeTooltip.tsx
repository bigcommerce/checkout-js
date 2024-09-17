import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconCardCodeAmex, IconCardCodeVisa, IconSize } from '@bigcommerce/checkout/ui';

import './CreditCardCodeTooltip.scss';

const CreditCardCodeTooltip: FunctionComponent = () => (
    <div className="dropdown-menu dropdown-menu--content dropdown-menu--card-code">
        <div className="form-ccFields-cvvExample">
            <div className="form-ccFields-cvvExampleDescription">
                <p>
                    <TranslatedString id="payment.credit_card_cvv_help_text" />
                </p>
            </div>

            <div className="form-ccFields-cvvExampleFigures">
                <figure>
                    <IconCardCodeVisa size={IconSize.Large} />
                </figure>

                <figure>
                    <IconCardCodeAmex size={IconSize.Large} />
                </figure>
            </div>
        </div>
    </div>
);

export default CreditCardCodeTooltip;
