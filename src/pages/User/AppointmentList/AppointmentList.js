import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AppointmentList.css";
import { useAuth } from "../../../contexts/AuthContext";
import Footer from "../../../components/Footer/Footer";
import Navbar from "../../../components/Navbar/Navbar";

const AppointmentList = () => {
    const [allAppointments, setAllAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5); // Number of items per page
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const auth = useAuth();
    const userId = auth.auth.user.id;

    // Fetch appointments from the backend
    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://127.0.0.1:8000/appointments/get_appointments/${userId}/`)
            .then((response) => {
                setAllAppointments(response.data.appointments);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching appointments:", error);
                setLoading(false);
            });
    }, [userId]);

    // Filter and search logic
    useEffect(() => {
        let filtered = allAppointments;

        // Filter by status
        if (filterStatus !== "All") {
            console.log('fileters :' , filterStatus)
            filtered = filtered.filter((app) => app.status.toLowerCase() === filterStatus.toLowerCase());
        }

        // Search by doctor name, reason, or date
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (app) =>
                    app.doctor_name.toLowerCase().includes(query) ||
                    app.reason_for_visit.toLowerCase().includes(query) ||
                    app.date.includes(query)
            );
        }

        setFilteredAppointments(filtered);
    }, [searchQuery, filterStatus, allAppointments]);

    // Update paginated appointments when currentPage or filteredAppointments changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setAppointments(filteredAppointments.slice(startIndex, endIndex));
    }, [filteredAppointments, currentPage, pageSize]);

    const cancelAppointment = (id) => {
        axios
            .post(`http://127.0.0.1:8000/appointments/${id}/user_cancel/${userId}`)
            .then(() => {
                alert("Appointment canceled successfully!");
                setAllAppointments((prev) => prev.filter((app) => app.id !== id));
            })
            .catch((error) => console.error("Error canceling appointment:", error));
    };

    const totalPages = Math.ceil(filteredAppointments.length / pageSize);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Navbar />
            <div className="appointment-list">
                <h2>Appointments</h2>

                {/* Search and Filter Controls */}
                <div className="search-filter-controls">

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-dropdown"
                    >
                        <option value="All">All</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="canceled">Cancelled</option>
                        <option value="completed">Completed</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search by doctor, reason, or date"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    
                </div>

                {appointments.length > 0 ? (
                    <>
                        <table className="appointment-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((app) => (
                                    <tr key={app.id}>
                                        <td>{app.doctor_name}</td>
                                        <td>{app.date}</td>
                                        <td>{app.time}</td>
                                        <td>{app.reason_for_visit}</td>
                                        <td style={app.status === 'canceled' ? { color: 'red' } : null}>{app.status}</td>
                                        <td>
                                            {app.status === "Confirmed" ? (
                                                <button
                                                    onClick={() => cancelAppointment(app.id)}
                                                    className="cancel-button"
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <span>{app.status}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No appointments found.</p>
                )}
            </div>
            <Footer />
        </>
    );
};

export default AppointmentList;
