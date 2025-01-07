import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './Sidebar.css'
import api from '../../../services/api';

function Sidebar({ userType, onSelectChat }) {
  const [items, setItems] = useState([]);
  const auth = useAuth();
  const [userId, setUserId] = useState(auth.auth.user.id);

  useEffect(() => {
    async function fetchItems() {
      try {
        let response;
        if (userType === 'doctor') {
          // Fetch patients for doctors
          response = await api.get(
            `appointments/doctors/${userId}/patients/`
          );
        } else if (userType === 'patient') {
          // Fetch doctors for patients
          response = await api.get(
            `appointments/patients/${userId}/doctors/`
          );
        }
        const modifiedData = response.data.map(item => ({
          ...item,
          userType: userType, 
        }));
  
        // Set the modified data
        setItems(modifiedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (userId) fetchItems();
  }, [userId, userType]);

  return (
    <div className="chat-sidebar">
      <h3>{userType === 'doctor' ? 'Patients' : 'Doctors'}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="sidebar-item"
              onClick={() => onSelectChat(item)}
            >
              {item.full_name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No {userType === 'doctor' ? 'patients' : 'doctors'} found.</p>
      )}
    </div>
  );
}

export default Sidebar;
