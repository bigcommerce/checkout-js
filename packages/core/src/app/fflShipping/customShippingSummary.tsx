import { Cart, Consignment } from "@bigcommerce/checkout-sdk";
import './customShippingSummary.scss'
import React from "react";

interface CustomShippingSummaryProps {
    cart: Cart;
    consignments: Consignment[];

}

const CustomShippingSummary: React.FC<CustomShippingSummaryProps> = ({  consignments }) => {



    return (
        <>
            <div className="customShippingSummaryContainer">

                {consignments.map(consignment => {
                    return (
                        <div key={consignment.id}>
                            {consignment.address.address1 == "-" && (
                                <div>
                                    <h2>{consignment.selectedShippingOption?.description}</h2>
                                    <p>Firearms will be sent to { consignment.address.company }</p>
                                </div>
                            )}
                            {consignment.address.address1 != "-" && (
                                <>
                                    <h2>{consignment.selectedShippingOption?.description}</h2>
                                    <p>{consignment.address.firstName + ", " + consignment.address.lastName}</p>
                                    <p>{consignment.address.address1}</p>
                                    <p>{consignment.address.city + ", " + consignment.address.stateOrProvince + ", " + consignment.address.postalCode}</p>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default CustomShippingSummary