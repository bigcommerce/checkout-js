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
                <img width={30} height={30} src={fitmentPartner} />
            </div>

            {isSelected && showInfo && (
                <div className="info-box">
                    <div className="selector">
                        <input type='radio' checked={isSelected} />
                    </div>
                    <div className="info">
                        <div className="info-name">
                            <h4>{fitmentCentre.company}</h4>
                            <span className="close-button" onClick={() => setShowInfo(false)}>
                                ⨉
                            </span>
                        </div>
                        <div className="info-address">
                            <span>
                                {fitmentCentre.street}, {fitmentCentre.suburb}, {fitmentCentre.state}{' '}
                                {fitmentCentre.postcode}
                            </span>
                        </div>
                        <div className="flex flex-row mt-3 items-center info-phone">
                            <span>ph: </span>
                            <a
                                href={fitmentCentre.phone ? `tel:${fitmentCentre.phone}` : '#'}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {fitmentCentre.phone}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
