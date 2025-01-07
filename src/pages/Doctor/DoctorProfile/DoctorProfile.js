import React, { useEffect, useState } from "react";
import "./DoctorProfile.css";
import ProfileIcon from '../../../Images/profile-icon.png';
import VerifiedBadge from '../../../Images/Verified.png'
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";

function DoctorProfile() {
    const [doctor, setDoctor] = useState({});
    const [editing, setEditing] = useState(false);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const auth = useAuth()
    const doctorId = auth.auth.user.id

    useEffect(() => {
        async function fetchDoctorProfile() {
            try {
                const response = await api.get(`doctors/profile/${doctorId}/`);
                setDoctor(response.data);
                
            } catch (error) {
                console.error("Error fetching doctor profile:", error);
            }
        }
        fetchDoctorProfile();
    }, [doctorId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        console.log('eeeeeeee' , e.target.files[0])
        setNewProfilePicture(e.target.files[0]);
    };

    const saveChanges = async () => {
        const formData = new FormData();
        Object.keys(doctor).forEach((key) => {
            if (key !== "profile_picture") { // Skip adding the existing profile_picture
                formData.append(key, doctor[key]);
            }
        });
    
        // Append only if a new file is selected
        if (newProfilePicture) {
            formData.append("profile_picture", newProfilePicture);
        }
    
        try {
            const response = await api.put(
                `doctors/profile/${doctorId}/`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setDoctor(response.data);
            setEditing(false);
            setNewProfilePicture(null); // Reset the state for the profile picture
        } catch (error) {
            console.error("Error updating doctor profile:", error);
        }
    };

    return (
        <div className="doctor-profile">
            <h2>Doctor Profile</h2>
            <div className="profile-picture-section">

                <img 
                    src={ doctor.profile_picture ? `https://findmydoctor.xyz${doctor.profile_picture}` : ProfileIcon } 
                    alt="Profile" 
                    className="profile-picture" 
                />
                {doctor.is_verified && (
                    <div className="verification-badge">
                        <img src={VerifiedBadge} alt="Verified" className="badge-icon" />
                        <span>You are verified by admin</span>
                    </div>
                )}

                {editing && (
                    <div>
                        <label htmlFor="profile-picture-upload">Change Profile Picture</label>
                        <input
                            type="file"
                            id="profile-picture-upload"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>
            <div className="profile-details">
                <div className="section">
                    <div className="sub-section">
                        <label>Full Name:</label>
                        <input
                            type="text"
                            name="full_name"
                            value={doctor.full_name || ""}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="sub-section">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={doctor.email || ""}
                            onChange={handleInputChange}
                            disabled={true}
                        />
                    </div>
                </div>

                <div className="section">
                    <div className="sub-section">
                        <label>Phone:</label>
                        <input
                            type="text"
                            name="phone"
                            value={doctor.phone || ""}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="sub-section">
                        <label>Gender:</label>
                        <select
                            name="gender"
                            value={doctor.gender || ""}
                            onChange={handleInputChange}
                            disabled={!editing}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="section">
                    <div className="sub-section">
                        <label>Date of Birth:</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={doctor.date_of_birth || ""}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                    <div className="sub-section">
                        <label>State:</label>
                        <input
                            type="text"
                            name="state"
                            value={doctor.state || ""}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    </div>
                </div>

                <div className="last-section">
                        <label>Address:</label>
                        <textarea
                            name="address"
                            value={doctor.address || ""}
                            onChange={handleInputChange}
                            disabled={!editing}
                        />
                    
                </div>
            </div>

            {editing ? (
                <button className="save-button" onClick={saveChanges}>
                    Save Changes
                </button>
            ) : (
                <button className="edit-button" onClick={() => setEditing(true)}>
                    Edit Profile
                </button>
            )}
        </div>
    );
}

export default DoctorProfile;
