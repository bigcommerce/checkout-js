import React from "react";
import { Address } from "@bigcommerce/checkout-sdk";
import "./CustomAddressForm.scss"

interface CustomAddressFormProps {
    hasFirearms: boolean;
    savedAddress: Address;
    formState: Address;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

const CustomAddressForm: React.FC<CustomAddressFormProps> = ({ hasFirearms, handleInputChange, formState }) => {
    return (
        <>
            <div className='CustomFormContainer'>
                <h2 className='customShippingSectionHeader'> {hasFirearms ? 'Additional ' : ''} Shipping Address</h2>
                <p className=''>This address will be used for any non-firearm products.</p>


                <div className="formRow">


                    <div className="customFormGroup">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            className='customFormInput'
                            type="text"
                            name="firstName"
                            id="firstName"
                            placeholder="First Name"
                            value={formState.firstName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="customFormGroup">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            className='customFormInput'
                            type="text"
                            name="lastName"
                            id="lastName"
                            placeholder="Last Name"
                            value={formState.lastName}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>


                <div className="customFormGroup">
                    <label htmlFor="address1">Address 1</label>
                    <input
                        className='customFormInput'
                        type="text"
                        name="address1"
                        id="address1"
                        placeholder="Address 1"
                        value={formState.address1}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="customFormGroup">
                    <label htmlFor="address2">Address 2</label>
                    <input
                        className='customFormInput'
                        type="text"
                        name="address2"
                        id="address2"
                        placeholder="Address 2"
                        value={formState.address2}
                        onChange={handleInputChange}
                    />
                </div>


                <div className="customFormGroup">
                    <label htmlFor="company">Company</label>
                    <input
                        className='customFormInput'
                        type="text"
                        name="company"
                        id="company"
                        placeholder="Company"
                        value={formState.company}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="customFormGroup">
                    <label htmlFor="city">City</label>
                    <input
                        className='customFormInput'
                        type="text"
                        name="city"
                        id="city"
                        placeholder="City"
                        value={formState.city}
                        onChange={handleInputChange}
                    />
                </div>


                <div className="formRow">

                    <div className="customFormGroup">
                        <label htmlFor="stateOrProvinceCode">State</label>
                        <select
                            className="customFormInput"
                            name="stateOrProvinceCode"
                            id="stateOrProvinceCode"
                            value={formState.stateOrProvinceCode}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a state</option>
                            <option value="AL">AL</option>
                            <option value="AK">AK</option>
                            <option value="AZ">AZ</option>
                            <option value="AR">AR</option>
                            <option value="CA">CA</option>
                            <option value="CO">CO</option>
                            <option value="CT">CT</option>
                            <option value="DE">DE</option>
                            <option value="FL">FL</option>
                            <option value="GA">GA</option>
                            <option value="HI">HI</option>
                            <option value="ID">ID</option>
                            <option value="IL">IL</option>
                            <option value="IN">IN</option>
                            <option value="IA">IA</option>
                            <option value="KS">KS</option>
                            <option value="KY">KY</option>
                            <option value="LA">LA</option>
                            <option value="ME">ME</option>
                            <option value="MD">MD</option>
                            <option value="MA">MA</option>
                            <option value="MI">MI</option>
                            <option value="MN">MN</option>
                            <option value="MS">MS</option>
                            <option value="MO">MO</option>
                            <option value="MT">MT</option>
                            <option value="NE">NE</option>
                            <option value="NV">NV</option>
                            <option value="NH">NH</option>
                            <option value="NJ">NJ</option>
                            <option value="NM">NM</option>
                            <option value="NY">NY</option>
                            <option value="NC">NC</option>
                            <option value="ND">ND</option>
                            <option value="OH">OH</option>
                            <option value="OK">OK</option>
                            <option value="OR">OR</option>
                            <option value="PA">PA</option>
                            <option value="RI">RI</option>
                            <option value="SC">SC</option>
                            <option value="SD">SD</option>
                            <option value="TN">TN</option>
                            <option value="TX">TX</option>
                            <option value="UT">UT</option>
                            <option value="VT">VT</option>
                            <option value="VA">VA</option>
                            <option value="WA">WA</option>
                            <option value="WV">WV</option>
                            <option value="WI">WI</option>
                            <option value="WY">WY</option>
                        </select>
                    </div>


                    <div className="customFormGroup">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input
                            className='customFormInput'
                            type="text"
                            name="postalCode"
                            id="postalCode"
                            placeholder="Postal Code"
                            value={formState.postalCode}
                            onChange={handleInputChange}
                        />
                    </div>

                </div>


            </div>

        </>
    )
}

export default CustomAddressForm;