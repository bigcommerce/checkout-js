export default function hideEditCartLink(isBuyNowCart: boolean, disableEditCart: boolean): boolean {
    return isBuyNowCart || disableEditCart;
}
