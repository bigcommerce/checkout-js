import React, { FunctionComponent } from 'react';

import {
    CheckoutContextProps,
    PaymentFormService,
    useCheckout,
    usePaymentFormContext,
} from '@bigcommerce/checkout/payment-integration-api';
import { Fieldset } from '@bigcommerce/checkout/ui';

import { InstrumentStorageField } from '../InstrumentStorageField';
import { InstrumentStoreAsDefaultField } from '../InstrumentStoreAsDefaultField';

interface StoreInstrumentFieldsetProps {
    isAccountInstrument?: boolean;
    instrumentId?: string;
}

interface WithStorageSettings {
    showSave: boolean;
    showSetAsDefault: boolean;
    setAsDefaultEnabled: boolean;
}

const useProps = (
    context: CheckoutContextProps,
    props: StoreInstrumentFieldsetProps,
    paymentForm: PaymentFormService,
): WithStorageSettings => {
    const {
        checkoutState: {
            data: { getInstruments },
        },
    } = context;

    const allInstruments = getInstruments();

    const saveIsChecked = Boolean(paymentForm.getFieldValue<boolean>('shouldSaveInstrument'));

    const { instrumentId } = props;

    const addingNewInstrument = !instrumentId;
    const hasAnyOtherInstruments = !!allInstruments && allInstruments.length > 0;
    const instrument =
        allInstruments && allInstruments.find(({ bigpayToken }) => bigpayToken === instrumentId);

    return {
        ...props,
        showSave: addingNewInstrument,
        showSetAsDefault:
            (addingNewInstrument && hasAnyOtherInstruments) ||
            Boolean(instrument && !instrument.defaultInstrument),
        setAsDefaultEnabled: !addingNewInstrument || saveIsChecked,
    };
};

const StoreInstrumentFieldset: FunctionComponent<StoreInstrumentFieldsetProps> = ({
    isAccountInstrument = false,
    ...props
}) => {
    const { paymentForm } = usePaymentFormContext();

    const { checkoutService, checkoutState } = useCheckout();

    const { showSave, showSetAsDefault, setAsDefaultEnabled } = useProps(
        { checkoutService, checkoutState },
        props,
        paymentForm,
    );

    return (
        <Fieldset>
            {showSave && <InstrumentStorageField isAccountInstrument={isAccountInstrument} />}

            {showSetAsDefault && (
                <InstrumentStoreAsDefaultField
                    disabled={!setAsDefaultEnabled}
                    isAccountInstrument={isAccountInstrument}
                />
            )}
        </Fieldset>
    );
};

export default StoreInstrumentFieldset;
