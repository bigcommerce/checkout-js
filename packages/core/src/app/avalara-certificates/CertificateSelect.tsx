import React, { useEffect, useState } from 'react';
import { Certificate } from './interfaces/Certificate';
import { fetchCertificates } from './services/LambdaService';
interface CertificateSelectProps {
    onSelect: (certificate: string) => void;
}


const CertificateSelect: React.FC<CertificateSelectProps> = ({onSelect }) => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [selectedCertificate, setSelectedCertificate] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCertificate(e.target.value);
        onSelect(e.target.value);
    };
    useEffect(() => {
        const getCertificates = async () => {
            try {
                const data = await fetchCertificates();
                setCertificates(data);
                console.log(certificates);
            } catch (error) {
                console.error('Error loading certificates:', error);
            }
        };

        getCertificates();
    }, []);

    return (
        <div className="dynamic-form-field floating-form-field dynamic-form-field--countryCode">
            <div className="form-field">
                <div className="floating-select-chevron">
                    <div className="icon">
                        <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
                        </svg>
                    </div>
                </div>
                <select
                    aria-labelledby="certificateSelect-label certificateSelect-field-error-message"
                    className="floating-select form-select optimizedCheckout-form-select"
                    data-test="certificateSelect-select"
                    id="certificateSelect"
                    name="certificateSelect"
                    value={selectedCertificate}
                    onChange={handleChange}
                >
                    <option value="">Select a certificate</option>
                        {certificates.map(certificate => (
                            <option key={certificate.id} value={certificate.id}>
                                {certificate.companyId}
                            </option>
                        ))}
                </select>
                <label htmlFor="certificateSelect" id="certificateSelect-label" className="floating-label form-label optimizedCheckout-form-label">
                    Certificate
                </label>
            </div>
        </div>
    );
};

export default CertificateSelect;
