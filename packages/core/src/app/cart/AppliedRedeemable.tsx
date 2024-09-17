import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconRemove } from '../ui/icon';

import './AppliedRedeemable.scss';

export interface AppliedRedeemableProps {
    isRemoving: boolean;
    onRemove(): void;
}

const AppliedRedeemable: FunctionComponent<AppliedRedeemableProps> = ({
    children,
    isRemoving,
    onRemove,
}) => (
    <div className="form-checklist-header">
        <div className="form-checklist-checkbox optimizedCheckout-form-checklist-checkbox">
            <span className="is-srOnly">
                <TranslatedString id="redeemable.applied_text" />
            </span>
        </div>

        <div className="form-label form-label-redeemable">
            <div className="redeemable">
                {children}
                <div className="redeemable-column redeemable-actions">
                    <button
                        className={classNames('redeemable-remove', { 'is-loading': isRemoving })}
                        data-test="redeemable-remove"
                        disabled={isRemoving}
                        onClick={onRemove}
                        type="button"
                    >
                        <IconRemove />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default AppliedRedeemable;
