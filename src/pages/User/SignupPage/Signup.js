import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import './Signup.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import api from '../../../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', gender: '', date_of_birth: '', state: '', address: '', password: '', confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessages, setErrorMessages] = useState('');
  const [timer, setTimer] = useState(30); // Set timer for 30 seconds
  const [resendAvailable, setResendAvailable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Yup validation schema
  const SignupSchema = Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .required('Phone number is required'),
    gender: Yup.string().oneOf(['Male', 'Female'], 'Select a valid gender').required('Gender is required'),
    date_of_birth: Yup.date().required('Date of birth is required'),
    state: Yup.string().required('State is required'),
    address: Yup.string().required('Address is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Check password strength dynamically
    if (e.target.name === 'password') {
      const strength = getPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data using Yup schema
    try {
      await SignupSchema.validate(formData, { abortEarly: false });
      setErrorMessages('');
      setFieldErrors({});  // Clear previous field errors

      const response = await api.post('accounts/register/', formData);
      console.log('OTP sent', response.data);
      setOtpSent(true);
      setResendAvailable(false);
      setTimer(30);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Collect validation error messages for each field
        const errors = error.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {});
        setFieldErrors(errors);
      } else {
        console.error('Registration error:', error.response ? error.response.data : error.message);
        setErrorMessages('An error occurred. Please try again.');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('accounts/verify-otp/', { ...formData, otp });
      console.log('User registered successfully', response.data);
      setErrorMessages('');
      navigate('/', { state: { message: 'Signup successful! Please log in.' } });
    } catch (error) {
      console.error('OTP verification error:', error.response ? error.response.data : error.message);
      setErrorMessages('Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await api.post('accounts/register/', formData);
      console.log('New OTP sent', response.data);
      setErrorMessages('A new OTP has been sent to your email.');
      setTimer(30);
      setResendAvailable(false);
    } catch (error) {
      console.error('Error resending OTP:', error.response ? error.response.data : error.message);
      setErrorMessages('Could not resend OTP. Please try again.');
    }
  };

  const getPasswordStrength = (password) => {
    const regexWeak = /.{8,}/;
    const regexMedium = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/;
    const regexStrong = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;

    if (regexStrong.test(password)) return 'Strong';
    if (regexMedium.test(password)) return 'Medium';
    if (regexWeak.test(password)) return 'Weak';
    return 'Too short';
  };

  // Countdown timer effect
  useEffect(() => {
    let countdown;
    if (timer > 0 && otpSent) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setResendAvailable(true);
    }
    return () => clearInterval(countdown);
  }, [timer, otpSent]);

  return (
    <div>
      <Navbar />
      
      <div className="signup-container">
        {/* Display General Error Messages */}
        {errorMessages && <div className="error-message">{errorMessages}</div>}
        
        {/* Signup form */}
        {!otpSent ? (
          <form onSubmit={handleSubmit} className="signup-form">
            <h2>Sign Up</h2>
            <label title="Enter your full legal name">
              Full Name:
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
              {fieldErrors.full_name && <p className="field-error">{fieldErrors.full_name}</p>}
            </label>
            <label title="Enter a valid email address">
              Email:
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </label>
            <label title="Enter your active phone number">
              Phone:
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
              {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
            </label>
            <label title="Select your gender">
              Gender:
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {fieldErrors.gender && <p className="field-error">{fieldErrors.gender}</p>}
            </label>
            <label title="Enter your date of birth">
              Date of Birth:
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
              {fieldErrors.date_of_birth && <p className="field-error">{fieldErrors.date_of_birth}</p>}
            </label>
            <label title="Enter your state of residence">
              State:
              <input type="text" name="state" value={formData.state} onChange={handleChange} required/>
              {fieldErrors.state && <p className="field-error">{fieldErrors.state}</p>}
            </label>
            <label title="Enter your current address">
              Address:
              <input type="text" name="address" value={formData.address} onChange={handleChange} required/>
              {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
            </label>
            <label title="Create a strong password">
              Password:
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              <p className={`password-strength ${passwordStrength.toLowerCase()}`}>Strength: {passwordStrength}</p>
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </label>
            <label title="Re-enter your password for confirmation">
              Confirm Password:
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
            </label>
            <button type="submit" className="signup-button">SIGN UP</button>
            <div className="signup-links">
              <Link to='/'>Already have an account?</Link><br />
              <Link to='/doctorsignup'>Sign up as a Doctor</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="otp-form">
            <h2>Enter OTP</h2>
            <label>OTP:</label>
            <input type="text" name="otp" value={otp} onChange={handleOtpChange} required />
            <button type="submit" className="otp-button">VERIFY OTP</button>
            
            {/* Display Timer and Resend Link */}
            <div className="otp-timer">
              {timer > 0 ? (
                <p>Please enter the OTP. Resend available in {timer} seconds.</p>
              ) : (
                <p>
                  Didn’t receive the OTP?{' '}
                  <span className="resend-link" onClick={handleResendOtp}>Resend OTP</span>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
