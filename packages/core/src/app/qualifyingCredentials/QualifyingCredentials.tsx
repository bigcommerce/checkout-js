import React, { FunctionComponent } from "react";
// import { withCheckout } from "../checkout";

export interface QualifyingCredentialsProps {
    navigateToNextStep(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
};

export interface WithCheckoutQualifyingCredentialsProps {};

const QualifyingCredentials: FunctionComponent<
    QualifyingCredentialsProps &
    WithCheckoutQualifyingCredentialsProps
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
            <div>Qualifying Credentials Step Here</div>
            <button onClick={handleSubmit}>Next</button>
        </div>
    );
}

// TODO: Write a mapToQualifyingCredentialsProps function to map the checkout SDK data to the props for this component

// TODO: Eventually wrap this with the withCheckout HOC when we need that data
export default QualifyingCredentials;