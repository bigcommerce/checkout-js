// @ts-nocheck
import React from 'react';
import MapContainer from './Map';
import DealerCard from './locator/DealerCard';
//import dealers from './dealer.json';
import './Locator.scss';

interface LocatorProps {
  storeHash: any;
  showLocator: any;
  handleCancel: any;
  selectDealer: any;
}

interface LocatorState {
  dealers: any;
  location: any;
  radius: any;
  miles: any;
  announcement: any;
  showToast: any;
}

export default class Locator extends React.PureComponent<LocatorProps, LocatorState> {

  constructor(props: any) {
    super(props);

    this.state = {
      dealers: [],
      location: "",
      radius: 5,
      miles: [5, 10, 30, 75],
      showToast: true
    };

    /* this.state = {
      dealers: dealers.dealers,
      location: null,
      miles: [5, 10, 30, 75]
    }; */

    this.handleSearch = this.handleSearch.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onChangeRadius = this.onChangeRadius.bind(this);
    this.onHandleKeypress = this.onHandleKeypress.bind(this);
    this.hideToast = this.hideToast.bind(this);
  }

  handleSearch(): void {
    const { location, radius } = this.state;

    if (location && radius) {
      fetch(`https://${process.env.HOST}/store-front/api/${this.props.storeHash}/dealers?location=${location}&radius=${radius}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
        }
      })
      .then(res => res.json())
      .then(data => {
        this.setState({
          dealers: data.dealers
        });
      }).catch(console.log);
    }
  }

  onChangeLocation(event: any): void {
    this.setState({ location: event.target.value });
  }

  onChangeRadius(event: any): void {
    this.setState({radius: event.target.value});
  }

  onHandleKeypress(event: any): void {
    if (event.charCode === 13) {
      this.handleSearch();
    }
  }

  hideToast(event: any): void {
    this.setState({ showToast: false });
  }

  render() {
    const { handleCancel, selectDealer } = this.props;
    return (
      <div className={`ffl-checkout-locator-container locator-modal ${this.props.showLocator?'show':''}`}>
        <div className="locator-modal-header">
          <div className="locator-modal-header-intro">
            Find your dealer
          </div>
          <input
            value={ this.state.location }
            onChange= {this.onChangeLocation}
            className="locator-navbar-input"
            placeholder="zip code, city, or ffl"
            onKeyPress={this.onHandleKeypress}
            />
          <div className="locator-modal-select">
            <select onChange={ this.onChangeRadius }>
              { this.state.miles.map((mile: any) => (
                 <option key={ mile } value={ mile }>{ mile } MILES</option>
              )) }
            </select>
            <div className="custom-arrow-wrapper">
              <div className="custom-arrow"></div>
            </div>
          </div>
          <button className="locator-button" onClick={ this.handleSearch } disabled={ false }>search</button>
          <button className="locator-button" onClick={ handleCancel }>cancel</button>
        </div>
        <div className="locator-modal-content">
          { this.state.dealers.map((dealer: any, index: number) => (
              <DealerCard
                key={ `${dealer}${index}` }
                dealer={ dealer }
                index={ index }
                selectDealer={ selectDealer } />
          )) }
          {this.state.dealers.length == 0 &&
            (
              <div>
                <h4>No dealers to display</h4>
              </div>
            )
          }
        </div>
        <div className="locator-modal-map">
          <div>
            <MapContainer dealers={ this.state.dealers } selectDealer={ selectDealer }  />
          </div>
          {
            (this.props.announcement && this.state.showToast) &&
            <div className="locator-toast-box">
              <div className="locator-toast-close">
                <a onClick={ this.hideToast } className="white-text">X</a>
              </div>
              <div className="locator-toast-text">
               { this.props.announcement }
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}
