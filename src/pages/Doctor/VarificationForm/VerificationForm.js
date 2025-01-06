import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VerificationForm.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../../services/api';

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component for picking location on the map
const LocationPicker = ({ setLocation }) => {
    const [markerPosition, setMarkerPosition] = useState([51.505, -0.09]); // Default position

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setMarkerPosition([lat, lng]);

            // Fetch address using reverse geocoding (Nominatim API)
            axios
                .get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
                )
                .then((response) => {
                    const address = response.data.display_name;
                    setLocation({ address, latitude: lat, longitude: lng });
                })
                .catch((error) => console.error('Error fetching address:', error));
        },
    });

    return markerPosition ? <Marker position={markerPosition} /> : null;
};

const VerificationForm = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [profileData, setProfileData] = useState({
        qualification: '',
        specialty: '',
        experience: '',
        hospital: '',
        license: '',
        issuing_authority: '',
        expiry_date: '',
        medical_registration: '',
    });
    const [location, setLocation] = useState({ address: '', latitude: null, longitude: null });

    const auth = useAuth();
    const doctorId = auth.auth.user.id;

    const [documentData, setDocumentData] = useState({
        idProof: null,
        medicalLicense: null,
        degreeCertificate: null,
    });

    // Yup validation schemas
    const profileValidationSchema = Yup.object().shape({
        qualification: Yup.string().required('Qualification is required'),
        specialty: Yup.string().required('Specialty is required'),
        experience: Yup.number()
            .typeError('Experience must be a number')
            .required('Experience is required'),
        hospital: Yup.string().required('Hospital name is required'),
        license: Yup.string().required('License number is required'),
        issuing_authority: Yup.string().required('Issuing authority is required'),
        expiry_date: Yup.date()
            .typeError('Invalid date')
            .required('License expiry date is required'),
        medical_registration: Yup.string().required('Medical council registration number is required'),
    });

    const documentValidationSchema = Yup.object().shape({
        idProof: Yup.mixed().required('ID Proof is required'),
        medicalLicense: Yup.mixed().required('Medical license is required'),
        degreeCertificate: Yup.mixed().required('Degree certificate is required'),
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleFileChange = (e, fileKey) => {
        setDocumentData({ ...documentData, [fileKey]: e.target.files[0] });
    };

    const handleNext = async (e) => {
        e.preventDefault();
        try {
            await profileValidationSchema.validate(profileData, { abortEarly: false });
            if (!location.address) {
                alert('Please select a clinic address on the map.');
                return;
            }
            setCurrentStep(2);
        } catch (err) {
            alert(err.errors.join('\n')); // Display validation errors
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await documentValidationSchema.validate(documentData, { abortEarly: false });

            const formData = new FormData();

            Object.entries(profileData).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('clinic_address', location.address); // Add clinic address
            formData.append('latitude', location.latitude); // Add latitude
            formData.append('longitude', location.longitude); // Add longitude
            Object.entries(documentData).forEach(([key, file]) => {
                formData.append(key, file);
            });

            const response = await api.post(
                `doctors/verify/${doctorId}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Verification submitted:', response.data);
            navigate('/doctordashboard');
        } catch (err) {
            if (err.name === 'ValidationError') {
                alert(err.errors.join('\n')); // Display validation errors
            } else {
                console.error('Error submitting verification:', err);
            }
        }
    };

    return (
        <div>
            <Navbar />
            <br />
            <div className="verification-container">
                <h2 className="form-title">
                    {currentStep === 1 ? 'PROFILE' : 'DOCUMENT'}{' '}
                    <span className="highlight">VERIFICATION</span>
                </h2>

                {currentStep === 1 && (
                    <form className="profile-verification-form" onSubmit={handleNext}>
                        <label>
                            Qualification
                            <input
                                type="text"
                                name="qualification"
                                value={profileData.qualification}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            Specialty
                            <input
                                type="text"
                                name="specialty"
                                value={profileData.specialty}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            Years of Experience
                            <input
                                type="number"
                                name="experience"
                                value={profileData.experience}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            Hospital Name
                            <input
                                type="text"
                                name="hospital"
                                value={profileData.hospital}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            Clinic Address (select on the map)
                            <textarea
                                value={location.address}
                                readOnly
                                placeholder="Select the location on the map"
                            />
                        </label>
                        <div className="map-container">
                            <MapContainer
                                center={[11.568161867727017, 76.03990184060308]} // Default map center
                                zoom={13}
                                style={{ height: '400px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationPicker setLocation={setLocation} />
                            </MapContainer>
                        </div>
                        <label>
                            License Number
                            <input
                                type="text"
                                name="license"
                                value={profileData.license}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            License Issuing Authority
                            <input
                                type="text"
                                name="issuing_authority"
                                value={profileData.issuing_authority}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            License Expiry Date
                            <input
                                type="date"
                                name="expiry_date"
                                value={profileData.expiry_date}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>
                        <label>
                            Medical Council Registration Number
                            <input
                                type="text"
                                name="medical_registration"
                                value={profileData.medical_registration}
                                onChange={handleProfileChange}
                                required
                            />
                        </label>

                        <button type="submit" className="submit-btn">
                            NEXT
                        </button>
                    </form>
                )}

                {currentStep === 2 && (
                    <form className="document-verification-form" onSubmit={handleSubmit}>
                        <div className="upload-field">
                            <label htmlFor="id-proof">ID PROOF</label>
                            <input
                                type="file"
                                id="id-proof"
                                onChange={(e) => handleFileChange(e, 'idProof')}
                                required
                            />
                            <p>Government-issued ID like Passport, Driving License, etc.</p>
                        </div>

                        <div className="upload-field">
                            <label htmlFor="medical-license">
                                MEDICAL LICENSE/CERTIFICATE UPLOAD
                            </label>
                            <input
                                type="file"
                                id="medical-license"
                                onChange={(e) => handleFileChange(e, 'medicalLicense')}
                                required
                            />
                            <p>Upload the official medical practice license.</p>
                        </div>

                        <div className="upload-field">
                            <label htmlFor="degree-certificate">DEGREE CERTIFICATES</label>
                            <input
                                type="file"
                                id="degree-certificate"
                                onChange={(e) => handleFileChange(e, 'degreeCertificate')}
                                required
                            />
                            <p>Upload degree certificates or other relevant qualifications.</p>
                        </div>

                        <button type="submit" className="submit-btn">
                            VERIFY
                        </button>
                    </form>
                )}
            </div>
            <br />
            <Footer />
        </div>
    );
};

export default VerificationForm;
