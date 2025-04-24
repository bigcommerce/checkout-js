import React, { FunctionComponent } from "react";
// import { withCheckout } from "../checkout";

export type DriversLicenseProps = {
    navigateToNextStep(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
};

export type WithCheckoutDriversLicenseProps = {};

const QualifyingCredentials: FunctionComponent<
    DriversLicenseProps &
    WithCheckoutDriversLicenseProps
> = (
    /**
     * props go here, can be destructured specifically or passed in as `...props` or `props`
     */
    props
) => {

    const handleSubmit = () => {
        const {
            navigateToNextStep,
        } = props;

        navigateToNextStep();
    }
    
    return (
        <div>
            <div>Drivers License</div>
            <button onClick={handleSubmit}>Next</button>
        </div>
    );
}

// TODO: Write a mapToDriversLicenseProps function to map the checkout SDK data to the props for this component

// TODO: Eventually wrap this with the withCheckout HOC when we need that data
export default QualifyingCredentials;