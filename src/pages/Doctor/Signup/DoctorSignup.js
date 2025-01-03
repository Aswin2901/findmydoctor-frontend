import React, { useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup'; // Import Yup
import { useFormik } from 'formik'; // Import Formik for validation
import './DoctorSignup.css';
import Navbar from '../../../components/Navbar/Navbar.js';
import Footer from '../../../components/Footer/Footer.js';
import { Link, useNavigate } from 'react-router-dom';

const DoctorSignup = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const [successMessage, setSuccessMessage] = useState(''); // Success message state

  // Define Yup validation schema
  const DoctorSignupSchema = Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    gender: Yup.string().oneOf(['Male', 'Female'], 'Select a valid gender').required('Gender is required'),
    date_of_birth: Yup.date().required('Date of birth is required'),
    state: Yup.string().required('State is required'),
    address: Yup.string().required('Address is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Use Formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      phone: '',
      gender: '',
      date_of_birth: '',
      state: '',
      address: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: DoctorSignupSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post('http://localhost:8000/doctors/register/', values);
        console.log('Registration successful', response.data);
        setErrorMessage('');
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        setErrorMessage('Registration failed. Please try again.');
        setSuccessMessage('');
      }
    },
  });

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form">
          <h2>DOCTOR SIGN UP HERE</h2>
          <form onSubmit={formik.handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="FULL NAME"
                value={formik.values.full_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.full_name && formik.errors.full_name && (
                <div className="field-error">{formik.errors.full_name}</div>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="EMAIL"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="field-error">{formik.errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="PHONE"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="field-error">{formik.errors.phone}</div>
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <div className="field-error">{formik.errors.gender}</div>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formik.values.date_of_birth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.date_of_birth && formik.errors.date_of_birth && (
                <div className="field-error">{formik.errors.date_of_birth}</div>
              )}
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                placeholder="STATE"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state && (
                <div className="field-error">{formik.errors.state}</div>
              )}
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="YOUR ADDRESS"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.address && formik.errors.address && (
                <div className="field-error">{formik.errors.address}</div>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="PASSWORD"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="field-error">{formik.errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                placeholder="CONFIRM PASSWORD"
                value={formik.values.confirm_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirm_password && formik.errors.confirm_password && (
                <div className="field-error">{formik.errors.confirm_password}</div>
              )}
            </div>

            {/* Display success or error message */}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button type="submit" className="signup-button">SIGN UP</button>
          </form>
          <div className="signup-links">
            <Link to='/'>Already have an account?</Link><br />
            <Link to='/signup'>Sign up as a user</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorSignup;
