import React from "react";
import "./SubNavbar.css"; // External CSS file for styles
import { useNavigate } from "react-router-dom";

const SubNavbar = () => {
    const navigate = useNavigate()
  return (
    <nav className="subnavbar">
      <ul className="nav-menu">
        <li className="nav-item dropdown">
          <a onClick={()=>{
            navigate('/home')
          }} className="nav-link">
            Home
          </a>
        </li>
        <li className="nav-item dropdown">
          <a onClick={()=>{
            navigate('/service')
          }} className="nav-link">
            Service 
          </a>
        </li>
        <li className="nav-item dropdown">
          <a onClick={()=>{
            navigate('/user/appointment_list')
          }} className="nav-link">
            Appointment 
          </a>
        </li>
        <li className="nav-item dropdown">
          <a onClick={()=>{
            navigate('/doctorlist')
          }} className="nav-link">
            Doctor's List 
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default SubNavbar;
