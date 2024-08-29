import React from 'react';

interface CertificateFormProps {
    form: {
        email: string;
        firstName: string;
        lastName: string;
        company: string;
        phone: string;
        address1: string;
        address2: string;
        city: string;
        countryCode: string;
        stateOrProvinceCode: string;
        postalCode: string;
    };
    onChange: (ev: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
    onSubmit: () => void;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ form, onChange, onSubmit }) => {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={onChange}
                value={form.email}
                className="form-input"
            />
            <input
                type="text"
                name="firstName"
                placeholder="First Name"
                onChange={onChange}
                value={form.firstName}
                className="form-input"
            />
            <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                onChange={onChange}
                value={form.lastName}
                className="form-input"
            />
            <input
                type="text"
                name="company"
                placeholder="Company Name (Optional)"
                onChange={onChange}
                value={form.company}
                className="form-input"
            />
            <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                onChange={onChange}
                value={form.phone}
                className="form-input"
            />
            <input
                type="text"
                name="address1"
                placeholder="Address"
                onChange={onChange}
                value={form.address1}
                className="form-input"
            />
            <input
                type="text"
                name="address2"
                placeholder="Apartment/Suite/Building (Optional)"
                onChange={onChange}
                value={form.address2}
                className="form-input"
            />
            <input
                type="text"
                name="city"
                placeholder="City"
                onChange={onChange}
                value={form.city}
                className="form-input"
            />
            <select
                name="countryCode"
                onChange={onChange}
                value={form.countryCode}
                className="form-select"
            >
                <option value="">Select a country</option>
                <option value="US">United States</option>

            </select>
            <select
                name="stateOrProvinceCode"
                onChange={onChange}
                value={form.stateOrProvinceCode}
                className="form-select"
            >
                <option value="">Select a state</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AS">American Samoa</option>
            </select>
            <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                onChange={onChange}
                value={form.postalCode}
                className="form-input"
            />
            <button type="submit" className="form-button">Submit</button>
        </form>
    );
};

export default CertificateForm;
