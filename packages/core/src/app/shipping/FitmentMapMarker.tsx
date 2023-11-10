import * as React from 'react'
import fitmentPartner from '../../static/img/fitment-partner.png';
import { FitmentCentre } from './Shipping';

type FitmentCentreMarkerProps = {
    fitmentCentre: FitmentCentre
    setSelectedFitmentCentre: (fitmentCentre: FitmentCentre) => void
    isSelected: boolean
    lat: number
    lng: number
}

export const FitmentCentreMarker = ({
    fitmentCentre,
    isSelected,
    setSelectedFitmentCentre,
}: FitmentCentreMarkerProps) => {
    const [showInfo, setShowInfo] = React.useState(true)

    return (
        <div className="fitment-map-marker">
            <div
                onClick={() => {
                    setShowInfo(true)
                    setSelectedFitmentCentre(fitmentCentre)
                }}
                className="image-wrapper"
            >
                <img src={fitmentPartner} />
            </div>

            {isSelected && showInfo && (
                <div className="bg-white p-3 w-80 bottom-10 -left-36 absolute text-sm rounded-lg shadow-xl info-box">
                    <div className="flex flex-row text-lg font-bold justify-between info-name">
                        <h4>{fitmentCentre.company}</h4>
                        <span className="close-button" onClick={() => setShowInfo(false)}>
                            X
                        </span>
                    </div>
                    <div className="flex flex-row mt-3 items-center info-address">
                        <p>
                            {fitmentCentre.street}, {fitmentCentre.suburb}, {fitmentCentre.state}{' '}
                            {fitmentCentre.postcode}
                        </p>
                    </div>
                    <div className="flex flex-row mt-3 items-center info-phone">
                        <a
                            href={fitmentCentre.phone ? `tel:${fitmentCentre.phone}` : '#'}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {fitmentCentre.phone}
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
