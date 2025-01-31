import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AppointmentHistory.css';
import api from '../../../services/api';

function AppointmentHistory({ doctorId }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [appointmentsPerPage] = useState(3);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        async function fetchAppointments() {
            setLoading(true);
            try {
                const response = await api.get(`appointments/history/${doctorId}/`);
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

    const handleDateChange = (date) => {
        const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA' ensures YYYY-MM-DD format
        setSelectedDate(formattedDate);
        setCurrentPage(1);
    };

    const clearDateSelection = () => {
        setSelectedDate(null);
        setCurrentPage(1);
    };

    const filteredAppointments = appointments.filter((appointment) => {
        const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
        const matchesDate = !selectedDate || appointment.date === selectedDate;
        return matchesStatus && matchesDate;
    });

    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.post(`appointments/cancel/${appointmentId}/`);
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

            {message && <div className="message">{message}</div>}

            <div className='head'>
                <div className="calendar-container">
                    <Calendar onChange={handleDateChange} value={selectedDate ? new Date(selectedDate) : null} />
                    {selectedDate && (
                        <button className="clear-date-button" onClick={clearDateSelection}>
                            Clear Date
                        </button>
                    )}
                </div>

                <div className="filter-container">
                    <label htmlFor="statusFilter">Filter by Status:</label>
                    <select
                        id="statusFilter"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">All</option>
                        <option value="Confirmed">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
            </div>

            {currentAppointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <table className="appointment-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAppointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>{appointment.patient_name}</td>
                                <td>{appointment.patient_phone}</td>
                                <td>{appointment.patient_gender}</td>
                                <td>{appointment.date}</td>
                                <td>{appointment.time}</td>
                                <td style={appointment.status === 'canceled' ? { color: "red" } : { color: 'green' }}>
                                    {appointment.status}
                                </td>
                                <td>{appointment.reason_for_visit}</td>
                                <td>
                                    {appointment.status === 'Confirmed' && (
                                        <button
                                            className="cancel-button"
                                            onClick={() => handleCancelAppointment(appointment.id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {totalPages > 1 && (
                <div className="pagination-container">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default AppointmentHistory;
