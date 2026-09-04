interface ShippingOptionExpiredErrorConditions {
    prevHasSelectedShippingOptions: boolean;
    newHasSelectedShippingOptions: boolean;
    isShippingStepFinished: boolean;
    isSigningOut: boolean;
}

export function shouldShowShippingOptionExpiredError({
    prevHasSelectedShippingOptions,
    newHasSelectedShippingOptions,
    isShippingStepFinished,
    isSigningOut,
}: ShippingOptionExpiredErrorConditions): boolean {
    // A wallet sign-out (e.g. Google Pay) intentionally clears the
    // wallet-provided shipping option server-side. Suppress the
    // expired-quote modal so the sign-out flow can complete.
    return (
        prevHasSelectedShippingOptions &&
        !newHasSelectedShippingOptions &&
        isShippingStepFinished &&
        !isSigningOut
    );
}
