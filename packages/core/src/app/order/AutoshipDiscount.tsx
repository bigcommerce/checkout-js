import React from "react";

export function AutoshipDiscount({discountAmount}: {
  discountAmount: number
}) {
  return <div
    aria-live="polite"
    className="cart-priceItem optimizedCheckout-contentPrimary"
    style={{
      marginTop: '-0.75rem',
      fontStyle: "italic",
      fontSize: "0.8em",
      display: "flex",
      alignItems: "center"
    }}>

    <svg fill="none" height="23" style={{
      height: 16,
      marginRight: 4
    }} viewBox="0 0 22 23" width="22" xmlns="http://www.w3.org/2000/svg">
      <path clipRule="evenodd" d="M21.9999 15.3159L18.2055 9.89996L14.411 15.3159H16.5382C15.9625 17.9514 13.7648 19.9134 11.1415 19.9134C8.47838 19.9134 6.25385 17.8915 5.71966 15.1955H2.90625C3.47167 19.5483 6.94327 22.8981 11.1415 22.8981C15.3009 22.8981 18.7471 19.6099 19.3603 15.3159H21.9999Z" fill="#B38EB0" fillRule="evenodd"/>
      <path clipRule="evenodd" d="M3.43323e-05 8.5326L3.79896 13.9549L7.59789 8.5326H5.46816C6.04453 5.89395 8.24487 3.92968 10.8713 3.92968C13.5375 3.92968 15.7647 5.95397 16.2995 8.6531H19.1162C18.5501 4.29519 15.0744 0.941397 10.8713 0.941397C6.70694 0.941397 3.2567 4.23352 2.64277 8.5326H3.43323e-05Z" fill="#681E61" fillRule="evenodd"/>
    </svg>

    <div>Includes Autoship savings of <span style={{
      fontWeight: "bold",
      color: "#8D2323"
    }}>${discountAmount.toFixed(2)}</span></div>
  </div>;
}


