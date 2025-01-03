import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AppointmentHistory.css';

function AppointmentHistory({ doctorId }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [appointmentsPerPage] = useState(3); // Set the number of appointments per page
    const [filterStatus, setFilterStatus] = useState('all'); // Default to show all

    useEffect(() => {
        async function fetchAppointments() {
            setLoading(true);
            try {
                const response = await axios.get(`http://127.0.0.1:8000/appointments/history/${doctorId}/`);
                console.log('response :' , response.data)
                setAppointments(response.data);
            } catch (error) {
                console.error('Error fetching appointment history:', error);
                setMessage('Failed to load appointment history.');
            } finally {
                setLoading(false);
            }
        }
        fetchAppointments();
    }, [doctorId]);

    // Filter appointments based on the selected status
    const filteredAppointments = filterStatus === 'all'
        ? appointments
        : appointments.filter((appointment) => appointment.status === filterStatus);

    // Calculate the current appointments to display
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

    // Calculate the total number of pages
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await axios.post(`http://127.0.0.1:8000/appointments/cancel/${appointmentId}/`);
                setAppointments((prevAppointments) =>
                    prevAppointments.filter((appointment) => appointment.id !== appointmentId)
                );
                setMessage('Appointment canceled successfully.');
            } catch (error) {
                console.error('Error canceling appointment:', error);
                setMessage('Failed to cancel the appointment.');
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading) {
        return <p>Loading appointment history...</p>;
    }

    return (
        <div className="appointment-history">
            <h2>Appointment History</h2>

            {/* Display message */}
            {message && <div className="message">{message}</div>}

            {/* Filter by status */}
            <div className="filter-container">
                <label htmlFor="statusFilter">Filter by Status:</label>
                <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1); // Reset to the first page when filtering
                    }}
                >
                    <option value="all">All</option>
                    <option value="Confirmed">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                </select>
            </div>

            {currentAppointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <ul className="appointment-list">
                    {currentAppointments.map((appointment) => (
                        <li key={appointment.id} className="appointment-item">
                            <div className="appointment-row">
                                <p><strong>Patient:</strong> {appointment.patient_name}</p>
                                <p><strong>Date:</strong> {appointment.date}</p>
                            </div>
                            <div className="appointment-row">
                                <p><strong>Patient Number:</strong> {appointment.patient_phone}</p>
                                <p><strong>Patient Gender:</strong> {appointment.patient_gender}</p>
                            </div>
                            
                            <div className="appointment-row">
                                <p><strong>Time:</strong> {appointment.time}</p>
                                <p style={appointment.status === 'canceled' ? { color: "red" } : { color: 'green' }}>
                                    <strong>Status:</strong> {appointment.status}
                                </p>
                            </div>
                            <div className="appointment-row">
                                <p><strong>Reason For visit:</strong> {appointment.reason_for_visit}</p>
                            </div>
                            <div className="button-row">
                                {appointment.status === 'Confirmed' && (
                                    <button
                                        className="cancel-button"
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                        Cancel Appointment
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
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
            )}
        </div>
    );
}

export default AppointmentHistory;