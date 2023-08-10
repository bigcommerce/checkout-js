// @ts-nocheck
import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

import InfoWindowEx from './locator/InfoWindowEx';
import Fees from './locator/Fees';
import Schedules from './locator/Schedules';

const mapStyles = {
  mapStyle: [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#212121"
      }
    ]
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575"
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#212121"
      }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#757575"
      }
    ]
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e"
      }
    ]
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575"
      }
    ]
  },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#181818"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1b1b1b"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#2c2c2c"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8a8a8a"
      }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#373737"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#565656"
      }
    ]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#656565"
      }
    ]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161"
      }
    ]
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#080808"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3d3d3d"
      }
    ]
  }
]
};

interface IProps {
  google: any;
  dealers: any[];
  selectDealer: any;
}

interface IState {
  activeMarker: any;
  activeDealer: any;
  showingInfoWindow: boolean;
}

export class MapContainer extends Component<IProps, IState> {

  constructor(props: any) {
      super(props);
      this.state = {
        activeMarker: null,
        activeDealer: null,
        showingInfoWindow: false
      };

  }

  onInfoWindowClose: () => void = () => console.log('window.closed');

  renderMarker = (dealer: any, index: any) => {
    if (dealer.preferred) {
      const svgMarker = {
        path: "m730.940002,1839.630005c-38.765991,-190.300049 -107.116028,-348.670044 -189.903015,-495.440063c-61.406982,-108.869995 -132.543976,-209.359985 -198.363983,-314.939941c-21.972015,-35.242981 -40.93399,-72.476013 -62.046997,-109.052979c-42.216003,-73.137024 -76.444,-157.934998 -74.269012,-267.932007c2.125,-107.473022 33.208008,-193.684021 78.029999,-264.172028c73.718994,-115.934998 197.201019,-210.988983 362.884003,-235.968994c135.466003,-20.423996 262.474976,14.082001 352.54303,66.748001c73.596008,43.03801 130.596008,100.526993 173.915955,168.280014c45.219971,70.716003 76.359985,154.259979 78.969971,263.231964c1.340088,55.830017 -7.799927,107.532043 -20.679932,150.41803c-13.030029,43.408997 -33.98999,79.695007 -52.640015,118.453979c-36.410034,75.658997 -82.050049,144.984009 -127.859985,214.343994c-136.437012,206.609985 -264.496033,417.310059 -320.580017,706.030029z",
        fillColor: "gold",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "white",
        scale: 0.025,
        anchor: new google.maps.Point(730, 1839),
        labelAnchor: new google.maps.Point(100, 100),
        labelOrigin: new google.maps.Point(730, 730)
      };

      return (
        <Marker
          icon={ svgMarker }
          dealer={ dealer }
          label={`${index+1}`}
          key= {index}
          onClick={ this.onMarkerClick }
          position={{ lat: dealer.lat, lng: dealer.lng }} />
        );
    }

    return (
      <Marker
        dealer={ dealer }
        label={`${index+1}`}
        key= {index}
        onClick={ this.onMarkerClick }
        position={{ lat: dealer.lat, lng: dealer.lng }} />
      );
  };

  getBounds = () => {
    let bounds = new this.props.google.maps.LatLngBounds();

    this.props.dealers.map((dealer: any) => {
      bounds.extend({ lat: dealer.lat, lng: dealer.lng });
    });

    if(bounds.isEmpty()) {
      return null;
    }

    return bounds;
  };

  onMarkerClick = (props: any, marker: any) => {
    const formattedDealerPhoneNumber = this.formatPhoneNumber(props.dealer.phone_number);

     this.setState({
       activeMarker: marker,
       activeDealer: props.dealer,
       activeDealerPhone: formattedDealerPhoneNumber,
       showingInfoWindow: true
     });
    }

   onMapClicked = () => {
     if (this.state.showingInfoWindow) {
       this.setState({
         showingInfoWindow: false,
         activeMarker: null,
         activeDealer: null
       })
     }
   };

   formatPhoneNumber = (phoneNumber) => {
    const cleanedNumber = (`${  phoneNumber}`).replace(/\D/g, '');
    const setNumber = cleanedNumber.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (setNumber) {
      return `(${setNumber[1]})-${setNumber[2]}-${setNumber[3]}`;
    }

    return null;
  };

   handleSelect = (dealer) => {
    const formattedDealerPhoneNumber = this.formatPhoneNumber(dealer.phone_number);

     this.props.selectDealer({
         firstName: dealer.business_name,
         lastName: dealer.license,
         phone: formattedDealerPhoneNumber,
         company: `${dealer.business_name} - ${dealer.license}`,
         address1: dealer.premise_street,
         address2: '',
         city: dealer.premise_city,
         stateOrProvinceCode: dealer.premise_state,
         shouldSaveAddress: true,
         postalCode: dealer.premise_zip,
         localizedCountry: 'United States',
         countryCode: 'US',
     });
   };

  render() {
    return (
      <Map
        google={this.props.google}
        onClick={this.onMapClicked}
        zoom={4}
        style={mapStyles}
        initialCenter={
          {
            lat: 37.0902,
            lng: -95.7129
          }
        }
        bounds={ this.getBounds() }
      >
        {this.props.dealers.map((dealer: any, index: any) => (
          this.renderMarker(dealer, index)
        ))}

        <InfoWindowEx
          visible={this.state.showingInfoWindow}
          marker={this.state.activeMarker}
          onClose={this.onInfoWindowClose}
          >
          <React.Fragment>
              { this.state.activeDealer &&
                (
                  <div className="info-window-content" title="Preferred Dealer">
                    {
                      this.state.activeDealer.preferred && <div className="locator-modal-dealer-star"></div>
                    }
                    <h4>{ this.state.activeDealer.business_name }</h4>
                    <h5>{ this.state.activeDealer.premise_street }</h5>
                    <a href={`tel:${ this.state.activeDealerPhone }`}>{ this.state.activeDealerPhone }</a>
                    <Fees fees={this.state.activeDealer.fees} />
                    <Schedules schedules={this.state.activeDealer.schedules} />
                    <button
                      className="locator-button dealer"
                      onClick={ () => this.handleSelect(this.state.activeDealer) }
                    >select</button>
                  </div>
                 )
              }
          </React.Fragment>
        </InfoWindowEx>
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(MapContainer);
