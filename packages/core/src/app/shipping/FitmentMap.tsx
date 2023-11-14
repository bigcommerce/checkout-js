import * as React from 'react'
import GoogleMapReact from 'google-map-react'
import { FitmentCentre } from './Shipping'
import { FitmentCentreMarker } from './FitmentMapMarker'

type FitmentCentreMapProps = {
    centre: google.maps.LatLngLiteral
    defaultCentre: google.maps.LatLngLiteral
    zoom: number
    setZoom: (zoom: number) => void
    fitmentCentres: FitmentCentre[]
    selectedFitmentCentre: FitmentCentre | undefined
    handleFitmentCentreSelect: (distributor: FitmentCentre) => void
}

export const FitmentCentreMap = ({
    fitmentCentres,
    selectedFitmentCentre,
    zoom,
    centre,
    defaultCentre,
    setZoom,
    handleFitmentCentreSelect,
}: FitmentCentreMapProps) => {
    return (
        <GoogleMapReact
            bootstrapURLKeys={{
                key: 'AIzaSyD_DJqzi5tcNvhZ2o-q-MsYLy0Lcw8VHn4',
            }}
            defaultCenter={defaultCentre}
            center={centre}
            defaultZoom={4}
            zoom={zoom}
            onChange={({ zoom }) => setZoom(zoom)}
            yesIWantToUseGoogleMapApiInternals={true}
        >
            {fitmentCentres.map((fitmentCentre, index) => (
                <FitmentCentreMarker
                    key={index}
                    isSelected={fitmentCentre == selectedFitmentCentre}
                    fitmentCentre={fitmentCentre}
                    setSelectedFitmentCentre={handleFitmentCentreSelect}
                    lat={fitmentCentre.latitude}
                    lng={fitmentCentre.longitude}
                />
            ))}
        </GoogleMapReact>
    )
}
