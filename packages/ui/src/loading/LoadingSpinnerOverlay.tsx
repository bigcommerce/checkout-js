import React from 'react';
import { FunctionComponent } from 'react';

interface LoadingSpinnerOverlayProps {
    isLoading: boolean;
    baseColor?: string;
    spinnerColor?: string;
    overlayColor?: string;
}

const SPINNER_ANIMATION = 'embedded-checkout-loading-spinner-overlay-rotation';

const LoadingSpinnerOverlay: FunctionComponent<LoadingSpinnerOverlayProps> = ({
  isLoading,
  baseColor = '#f3f3f3',
  spinnerColor = '#3498db',
  overlayColor = 'rgba(0,0,0,.8)',
}) => {
    const managedSpinnerStyles = {
        border: `8px solid ${baseColor}`,
        borderTop: `8px solid ${spinnerColor}`,
        animation: `${SPINNER_ANIMATION} 1s linear infinite`,
    };
    const managedOverlayStyles = {
        backgroundColor: `${overlayColor}`,
    };

    if (!isLoading) {
        return null;
    }

    return <div className="loading-spinner-overlay" id={SPINNER_ANIMATION} style={managedOverlayStyles}>
        <div className="loading-spinner-animation" style={managedSpinnerStyles}></div>
    </div>
}

export default LoadingSpinnerOverlay;
