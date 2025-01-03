import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './pages/User/SignupPage/Signup';
import Login from './pages/User/LoginPage/Login';
import Home from './pages/User/HomePage/Home';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import '@fortawesome/fontawesome-free/css/all.min.css';
import VerificationForm from './pages/Doctor/VarificationForm/VerificationForm';
import DoctorSignup from './pages/Doctor/Signup/DoctorSignup';
import DoctorDashboard from './pages/Doctor/Dashboard/DoctorDashboard';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import GoogleCallback from './components/GoogleCallback/GoogleCallback';
import DoctorList from './pages/User/DoctorList/DoctorList';
import ProfilePage from './pages/User/Profile/ProfilePage';
import Navbar from './components/Navbar/Navbar';
import MyDoctorsPage from './pages/User/MyDoctor.js/MyDoctorsPage';
import NotificationPage from './pages/User/Notification/NotificationPage';
import DoctorNotificationPage from './pages/Doctor/DoctorNotification/DoctorNotificationPage';
import Intro from './pages/Intro';
import ServicePage from './pages/User/ServicePage/ServicePage';
import Sidebar from './components/Chat/SideBar/Sidebar';
import ChatArea from './components/Chat/ChatArea/ChatArea';
import AppointmentList from './pages/User/AppointmentList/AppointmentList';
import DoctorProfile from './pages/Doctor/DoctorProfile/DoctorProfile';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/intro' element={<Intro/>}/>
          <Route path='/navbar' element={<Navbar/>}/>
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/doctorsignup" element={<DoctorSignup />} />
          <Route path="/doctordashboard" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
          <Route path="/profilevarification" element={<VerificationForm />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/oauth/callback" element={<GoogleCallback />} /> 
          <Route path="/doctorlist" element={<DoctorList/>} />
          <Route path='/profile' element = {<PrivateRoute><ProfilePage/></PrivateRoute>}/>
          <Route path='/mydoctor' element = {<PrivateRoute><MyDoctorsPage/></PrivateRoute>}/>
          <Route path='/notification' element= {<PrivateRoute><NotificationPage/></PrivateRoute>}/>
          <Route path='/doctor/notification' element= {<PrivateRoute> <DoctorNotificationPage/> </PrivateRoute>}/>
          <Route path='/service' element= {<ServicePage/>}/>
          <Route path='/user/appointment_list' element= {<PrivateRoute><AppointmentList/></PrivateRoute>}/>
          <Route path='/doctor/profile' element= {<PrivateRoute><DoctorProfile/></PrivateRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
