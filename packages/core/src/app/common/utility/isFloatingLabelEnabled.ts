import { CheckoutContextProps } from '../../checkout';

export default function isFloatingLabelEnabled(context: CheckoutContextProps): boolean {
    return (
        context.checkoutState.data.getConfig()?.checkoutSettings.features[
            'CHECKOUT-6879.enable_floating_labels'
        ] ?? false
    );
}
