import React, { memo } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Toggle } from '../../ui/toggle';

interface ShippingOptionAdditionalDescriptionProps {
    description: string;
}

const ShippingOptionAdditionalDescription: React.FunctionComponent<
    ShippingOptionAdditionalDescriptionProps
> = ({ description }) => {
    const CHRACTER_LIMIT = 45;

    return (
        <div className="shippingOption-additionalDescription--container">
            <Toggle openByDefault={description.length < CHRACTER_LIMIT}>
                {({ isOpen, toggle }) => (
                    <>
                        <span
                            className={`shippingOption-additionalDescription ${
                                isOpen
                                    ? 'shippingOption-additionalDescription--expanded'
                                    : 'shippingOption-additionalDescription--collapsed'
                            }`}
                        >
                            {description}
                        </span>
                        {!isOpen && (
                            <a className="shippingOption-readMore" onClick={preventDefault(toggle)}>
                                <TranslatedString id="common.show_more" />
                            </a>
                        )}
                    </>
                )}
            </Toggle>
        </div>
    );
};

export default memo(ShippingOptionAdditionalDescription);
