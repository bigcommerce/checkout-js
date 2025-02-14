// @ts-nocheck
export default async function appendFFLtoCheckoutNotes(
  checkout,
  updateCheckout,
  selectedFFL,
): Promise<CheckoutSelectors> {
  // Appends FFL information to the checkout order comments in the following format:
  // Format: <existing message>|FFL#<license>|Expiration:<date>|EZcheck:<url>
  const months = {
    A: '01',
    B: '02',
    C: '03',
    D: '04',
    E: '05',
    F: '06',
    G: '07',
    H: '08',
    J: '09',
    K: '10',
    L: '11',
    M: '12',
  };
  const expiryMonth = months[selectedFFL.slice(13, 14)];
  const expiryYear = `202${selectedFFL.slice(12, 13)}`;

  // Parse FFL number components for ATF link
  // Split by dashes and get relevant parts
  const fflParts = selectedFFL.split('-');
  const licsRegn = fflParts[0]; // First part (6)
  const licsDis = fflParts[1]; // Second part (04)
  const licsSeq = fflParts[5]; // Last part (03791)
  const atfLink = `https://fflezcheck.atf.gov/FFLEzCheck/fflSearch?licsRegn=${licsRegn}&licsDis=${licsDis}&licsSeq=${licsSeq}`;

  const message = `${checkout.customerMessage}|FFL#${selectedFFL}|Expiration:${expiryMonth}/01/${expiryYear}|EZcheck:${atfLink}`;

  await updateCheckout({ customerMessage: message });
}
