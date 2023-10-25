import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { FunctionComponent, SyntheticEvent, useCallback, useEffect, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { DropdownTrigger } from '../../ui/dropdown';
import { FormField } from '../../ui/form';

export interface MollieCustomCardFormProps {
    method: PaymentMethod;
}

export interface Issuer {
    name: string;
    image: {
        size1x: string;
    };
    id: string;
}

interface HiddenInputProps extends FieldProps {
    selectedIssuer?: Issuer;
}

interface SelecteIssuerProp {
    selectedIssuer: Issuer;
}

interface OptionButtonProps {
    issuer: Issuer;
    className?: string;
    onClick?(event: SyntheticEvent<EventTarget>): void;
}

const MollieAPMCustomForm: FunctionComponent<MollieCustomCardFormProps & WithLanguageProps> = ({
    method,
    language,
}) => {
    const issuers: Issuer[] = method.initializationData?.paymentMethodsResponse;

    const [selectedIssuer, setSelectedIssuer] = useState<Issuer>({
        name: language.translate('payment.select_your_bank'),
        id: '',
        image: { size1x: '' },
    });
    const render = useCallback(
        (props: FieldProps) => <HiddenInput {...props} selectedIssuer={selectedIssuer} />,
        [selectedIssuer],
    );

    if (!issuers || issuers.length === 0) {
        return <></>;
    }

    const handleClick = ({ currentTarget }: SyntheticEvent<HTMLButtonElement>) => {
        const _selectedIssuer = issuers.find(({ id }) => id === currentTarget.dataset.id);

        if (!_selectedIssuer) {
            return;
        }

        setSelectedIssuer(_selectedIssuer);
    };

    const issuersList = (
        <ul
            className="dropdown-menu instrumentSelect-dropdownMenu mollie-instrument-card"
            id="issuersDropdown"
        >
            {issuers.map((issuer) => (
                <li className="dropdown-menu-item dropdown-menu-item--select" key={issuer.id}>
                    <OptionButton issuer={issuer} onClick={handleClick} />
                </li>
            ))}
        </ul>
    );

    return (
        <>
            <DropdownTrigger dropdown={issuersList}>
                <IssuerSelectButton selectedIssuer={selectedIssuer} />
            </DropdownTrigger>
            <FormField input={render} name="issuer" />
        </>
    );
};

export const HiddenInput: FunctionComponent<HiddenInputProps> = ({
    field: { value, ...restField },
    form,
    selectedIssuer,
}) => {
    const Input = useCallback(() => <input {...restField} type="hidden" />, [restField]);

    useEffect(() => {
        if (value === selectedIssuer) {
            return;
        }

        form.setFieldValue(restField.name, selectedIssuer?.id);
    }, [value, form, selectedIssuer, restField.name]);

    return <Input />;
};

export const IssuerSelectButton: FunctionComponent<SelecteIssuerProp> = ({ selectedIssuer }) => (
    <a
        className="instrumentSelect instrumentSelect-card button dropdown-button dropdown-toogle--select"
        href="#"
        id="issuerToggle"
        onClick={preventDefault()}
    >
        {selectedIssuer.name}
    </a>
);

export const OptionButton: FunctionComponent<OptionButtonProps> = ({ issuer, ...props }) => {
    const { name, image, id } = issuer;

    return (
        <a className="instrumentSelect-details mollie-instrument-list" {...props} data-id={id}>
            <label className="mollie-instrument-left">{name}</label>
            <img alt={name} data-test="cart-item-image" src={image.size1x} />
        </a>
    );
};

export default withLanguage(MollieAPMCustomForm);
