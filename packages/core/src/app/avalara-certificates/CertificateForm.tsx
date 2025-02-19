import React, { useEffect, useState } from 'react';
import { FormikProps, withFormik } from 'formik';
import * as Yup from 'yup';
import stateAbbreviations from './stateAbbreviations';
import stateReasons from './stateReasons';
import Select from 'react-select';
import './certificateForm.scss';
import { CertificateFormValues } from './types';

interface CertificateFormProps {
    initialRegion?: string;
    onSubmit: (values: CertificateFormValues) => void;
}
interface OptionType {
    value: string;
    label: string;
}
const labelOptions: OptionType[] =[
    { value: '19', label: 'AFFIDAVIT' },
    { value: '29', label: 'AUTO-VALIDATION NO ISSUES FOUND' },
    { value: '22', label: 'CERTEXPRESS IMPORT' },
    { value: '26', label: 'CERTEXPRESS PUBLIC UPLOAD' },
];

const CertificateForm = ({
    values,
    touched,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
}: FormikProps<CertificateFormValues>) => {
    const [reasons, setReasons] = useState<string[]>([]);
    useEffect(() => {
        if (values.region) {
            const selectedState: keyof typeof stateReasons =  values.region;
            const reasonsForState = stateReasons[selectedState] || [];
            setReasons(reasonsForState);
            setFieldValue('exemptionReason', ''); // Resetear el select de razones cuando cambie la región
        }
    }, [values.region, setFieldValue]);

    return (
        <form className="form certificate-form" onSubmit={handleSubmit}>
            <fieldset className="form-fieldset">
                <div className="form-body">
                    {/* Región */}
                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="region">Regions Covered by Certificate</label>
                            <span className="required-label">Required</span>
                            <select
                                name="region"
                                id="region"
                                className="form-input"
                                value={values.region}
                                onChange={handleChange}
                            >
                                <option value="">Select a Region</option>
                                {Object.keys(stateAbbreviations).map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                            {touched.region && errors.region && <div className="error">{errors.region}</div>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="exemptionReason">Reason for Exemption</label>
                            <span className="required-label">Required</span>
                            <select
                                name="exemptionReason"
                                id="exemptionReason"
                                className="form-input"
                                value={values.exemptionReason}
                                onChange={handleChange}
                            >
                                <option value="">Select a Reason</option>
                                {reasons.map((reason) => (
                                    <option key={reason} value={reason}>
                                        {reason}
                                    </option>
                                ))}
                            </select>
                            {touched.exemptionReason && errors.exemptionReason && (
                                <div className="error">{errors.exemptionReason}</div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="effectiveDate">Effective Date</label>
                            <span className="required-label">Required</span>
                            <input
                                type="date"
                                name="effectiveDate"
                                id="effectiveDate"
                                className="form-input"
                                value={values.effectiveDate}
                                onChange={handleChange}
                            />
                            {touched.effectiveDate && errors.effectiveDate && (
                                <div className="error">{errors.effectiveDate}</div>
                            )}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="entityUseCode">Entity Use Code</label>
                            <span className="required-label">Optional</span>
                            <input
                                type="text"
                                name="entityUseCode"
                                id="entityUseCode"
                                className="form-input"
                                value={values.entityUseCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="exemptionDescription">Exemption Description</label>
                            <span className="required-label">Optional</span>
                            <input
                                type="text"
                                name="exemptionDescription"
                                id="exemptionDescription"
                                className="form-input"
                                value={values.exemptionDescription}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label htmlFor="certificateLabels">Certificate Labels</label>
                            <span className="required-label">Optional</span>
                            <Select
                                id="certificateLabels"
                                name="certificateLabels"
                                options={labelOptions}
                                isMulti
                                value={values.certificateLabels}
                                onChange={(selected) => setFieldValue('certificateLabels', selected)}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="button button--primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                Creating Certificate...
                                <span className="spinner"></span>
                            </>
                        ) : (
                            'Create Certificate'
                        )}
                    </button>
                </div>

            </fieldset>
        </form>
    );
};

const EnhancedCertificateForm = withFormik<CertificateFormProps, CertificateFormValues>({
    mapPropsToValues: (props) => ({
        region: props.initialRegion || '',
        exemptionReason: '',
        effectiveDate: '',
        entityUseCode: '',
        exemptionDescription: '',
        certificateLabels: [],
    }),

    validationSchema: Yup.object().shape({
        region: Yup.string().required('Region is required'),
        exemptionReason: Yup.string().required('Reason for exemption is required'),
        effectiveDate: Yup.date().required('Effective date is required').nullable(),
    }),

    handleSubmit: (values, { props }) => {
        props.onSubmit(values);
    },
})(CertificateForm);

export default EnhancedCertificateForm;
