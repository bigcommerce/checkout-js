// @ts-nocheck
import React from 'react';
import './CustomShippingForm.scss';

interface CustomShippingFormProps {
    customShippingAddress: string;
    customShippingAddressError: boolean;
    customShippingApartment: string;
    customShippingCity: string;
    customShippingCityError: boolean;
    customShippingCompany: string;
    customShippingFirstName: string;
    customShippingFirstNameError: boolean;
    customShippingLastName: string;
    customShippingLastNameError: boolean;
    customShippingPhone: string;
    customShippingPostal: string;
    customShippingPostalError: boolean;
    onChangeCustomShippingField: any;
}

interface CustomShippingFormState {}

export default class CustomShippingForm extends React.PureComponent<CustomShippingFormProps, CustomShippingFormState> {
    constructor(props: any) {
        super(props);

        this.onChangeField = this.onChangeField.bind(this);
    }

    onChangeField(event: any): void {
        const value = event.target.value;
        const fieldId = event.target.id;
        
        this.props.onChangeCustomShippingField(value, fieldId)
    }

    render() {
        return (
            <div className="checkout-address">
                <div className={ "dynamic-form-field dynamic-form-field--firstName " + (this.props.customShippingFirstNameError ? "form-field--error" : "") }>
                    <div className="form-field">
                        <label id="firstNameInput-label" className="form-label optimizedCheckout-form-label">First Name</label>
                        <input
                            aria-labelledby="firstNameInput-label firstNameInput-field-error-message"
                            id="customShippingFirstName"
                            type="text"
                            className="form-input optimizedCheckout-form-input"
                            name="firstName"
                            value={ this.props.customShippingFirstName }
                            onChange={ this.onChangeField }
                        />
                        <ul className={ "form-field-errors " + (this.props.customShippingFirstNameError ? "" : "hide") }>
                            <li className="form-field-error">
                                <label aria-live="polite" className="form-inlineMessage" id="firstNameInput-field-error-message" role="alert">
                                    First Name is required
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={ "dynamic-form-field dynamic-form-field--lastName " + (this.props.customShippingLastNameError ? "form-field--error" : "") }>
                    <div className="form-field">
                        <label id="lastNameInput-label" className="form-label optimizedCheckout-form-label">Last Name</label>
                        <input
                            aria-labelledby="lastNameInput-label lastNameInput-field-error-message"
                            id="customShippingLastName"
                            type="text"
                            className="form-input optimizedCheckout-form-input"
                            name="lastName"
                            value={ this.props.customShippingLastName }
                            onChange={ this.onChangeField }
                        />
                        <ul className={ "form-field-errors " + (this.props.customShippingLastNameError ? "" : "hide") }>
                            <li className="form-field-error">
                                <label aria-live="polite" className="form-inlineMessage" id="firstNameInput-field-error-message" role="alert">
                                    Last Name is required
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="dynamic-form-field dynamic-form-field--company">
                    <div className="form-field">
                        <label id="companyInput-label" className="form-label optimizedCheckout-form-label">Company Name <small className="optimizedCheckout-contentSecondary">(Optional)</small></label>
                        <input
                            aria-labelledby="companyInput-label companyInput-field-error-message"
                            id="customShippingCompany"
                            type="text"
                            className="form-input optimizedCheckout-form-input"
                            name="company"
                            value={ this.props.customShippingCompany }
                            onChange={ this.onChangeField }
                        />
                    </div>
                </div>
                <div className="dynamic-form-field dynamic-form-field--phone">
                    <div className="form-field">
                        <label id="phoneInput-label" className="form-label optimizedCheckout-form-label">Phone Number <small className="optimizedCheckout-contentSecondary">(Optional)</small></label>
                        <input 
                            aria-labelledby="phoneInput-label phoneInput-field-error-message" 
                            id="customShippingPhone" 
                            type="tel" 
                            className="form-input optimizedCheckout-form-input" 
                            name="phone" 
                            value={ this.props.customShippingPhone }
                            onChange={ this.onChangeField }
                        />
                    </div>
                </div>
                <div className={ "dynamic-form-field dynamic-form-field--addressLine1 " + (this.props.customShippingAddressError ? "form-field--error" : "") }>
                    <div className="form-field">
                        <label id="addressLine1Input-label" className="form-label optimizedCheckout-form-label">Address</label>
                        <input
                            aria-labelledby="addressLine1Input-label addressLine1Input-field-error-message"
                            id="customShippingAddress"
                            type="text"
                            className="form-input optimizedCheckout-form-input"
                            name="address1"
                            value={ this.props.customShippingAddress }
                            onChange={ this.onChangeField }
                        />
                        <ul className={ "form-field-errors " + (this.props.customShippingAddressError ? "" : "hide") }>
                            <li className="form-field-error">
                                <label aria-live="polite" className="form-inlineMessage" id="firstNameInput-field-error-message" role="alert">
                                    Address is required
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="dynamic-form-field dynamic-form-field--addressLine2">
                    <div className="form-field">
                        <label id="addressLine2Input-label" className="form-label optimizedCheckout-form-label">Apartment/Suite/Building <small className="optimizedCheckout-contentSecondary">(Optional)</small></label>
                        <input
                            aria-labelledby="addressLine2Input-label addressLine2Input-field-error-message"
                            id="customShippingAddress"
                            type="text"
                            className="form-input optimizedCheckout-form-input"
                            name="address2"
                            value={ this.props.customShippingApartment }
                            onChange={ this.onChangeField }
                        />
                    </div>
                </div>
                <div className={ "dynamic-form-field dynamic-form-field--city " + (this.props.customShippingCityError ? "form-field--error" : "") }>
                    <div className="form-field">
                        <label id="cityInput-label" className="form-label optimizedCheckout-form-label">City</label>
                        <input 
                            aria-labelledby="cityInput-label cityInput-field-error-message" 
                            id="customShippingCity" 
                            type="text" 
                            className="form-input optimizedCheckout-form-input" 
                            name="city" 
                            value={ this.props.customShippingCity }
                            onChange={ this.onChangeField }
                        />
                        <ul className={ "form-field-errors " + (this.props.customShippingCityError ? "" : "hide") }>
                            <li className="form-field-error">
                                <label aria-live="polite" className="form-inlineMessage" id="firstNameInput-field-error-message" role="alert">
                                    City required
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={ "dynamic-form-field dynamic-form-field--postCode " + (this.props.customShippingPostalError ? "form-field--error" : "") }>
                    <div className="form-field">
                        <label id="postCodeInput-label" className="form-label optimizedCheckout-form-label">Postal Code</label>
                        <input
                            aria-labelledby="postCodeInput-label postCodeInput-field-error-message"
                            id="customShippingPostal"
                            type="text"
                            className="form-input optimizedCheckout-form-input"
                            name="postalCode"
                            value={ this.props.customShippingPostal }
                            onChange={ this.onChangeField }
                        />
                        <ul className={ "form-field-errors " + (this.props.customShippingPostalError ? "" : "hide") }>
                            <li className="form-field-error">
                                <label aria-live="polite" className="form-inlineMessage" id="firstNameInput-field-error-message" role="alert">
                                    Postal Code is required
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
