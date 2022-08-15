import { CustomerPasswordRequirements, ShopperConfig } from '@bigcommerce/checkout-sdk';

export interface PasswordRequirements {
    minLength: number;
    alpha: RegExp;
    numeric: RegExp;
    description?: string;
}

export function getPasswordRequirementsFromConfig(config: ShopperConfig): PasswordRequirements {
    const {
        passwordRequirements: { minlength, error: description, alpha, numeric },
    } = config;

    return getPasswordRequirements({
        minlength,
        description,
        alpha,
        numeric,
    });
}

export default function getPasswordRequirements({
    minlength,
    description,
    alpha,
    numeric,
}: CustomerPasswordRequirements): PasswordRequirements {
    const allSlashes = new RegExp('/', 'g');

    return {
        minLength: minlength,
        description,
        alpha: new RegExp(alpha.replace(allSlashes, '')),
        numeric: new RegExp(numeric.replace(allSlashes, '')),
    };
}
