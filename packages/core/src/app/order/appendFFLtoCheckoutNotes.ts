// @ts-nocheck
export default async function appendFFLtoCheckoutNotes(checkout, updateCheckout, selectedFFL): Promise<CheckoutSelectors> {
    // FFL-290 sample customer message to be appended to the checkout
    // <existing customer message>|FFL#6-04-013-07-5A-03791|Expiration:10/12/2024
    const months = {
        "A": "01",
        "B": "02",
        "C": "03",
        "D": "04",
        "E": "05",
        "F": "06",
        "G": "07",
        "H": "08",
        "J": "09",
        "K": "10",
        "L": "11",
        "M": "12"
    }
    const expiryMonth = months[selectedFFL.slice(13,14)];
    const expiryYear = `202${selectedFFL.slice(12,13)}`
    const message = `${checkout.customerMessage}|FFL#${selectedFFL}|Expiration:${expiryMonth}/01/${expiryYear}`

    await updateCheckout({ customerMessage: message });
}
