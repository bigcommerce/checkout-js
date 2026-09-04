export const getRedeemableLabelId = (
    disableGiftCertificate?: boolean,
    disableCoupon?: boolean,
): string => {
    if (disableGiftCertificate) {
        return 'redeemable.coupon_text';
    }

    if (disableCoupon) {
        return 'redeemable.gift_certificate_text';
    }

    return 'redeemable.toggle_action';
};
