import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import dayjs from 'dayjs';
import 'react-calendar/dist/Calendar.css';
import './AppointmentManagement.css';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

function AppointmentManagement() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState(null);
    const [startAMPM, setStartAMPM] = useState('AM');
    const [endTime, setEndTime] = useState(null);
    const [endAMPM, setEndAMPM] = useState('AM');
    const [isSettingStartTime, setIsSettingStartTime] = useState(true);
    const [leaveDates, setLeaveDates] = useState([]);
    const [breakTimes, setBreakTimes] = useState([]);
    const [consultationDuration, setConsultationDuration] = useState(15); // Default duration in minutes
    const [key, setKey] = useState(0);
    const auth = useAuth();
    const [userId] = useState(auth.auth.user.id);


    const handleDateClick = (date) => {
        console.log(date)
        setSelectedDate(date);
    };

    const handleTimeChange = (time) => {
        if (isSettingStartTime) {
            setStartTime(dayjs(time));
        } else {
            setEndTime(dayjs(time));
        }
    };

    const switchTimeSetting = (settingStartTime) => {
        setIsSettingStartTime(settingStartTime);
        setKey((prevKey) => prevKey + 1);
    };

    const addLeave = async () => {
        try {
            await api.post(`doctors/leave/`, {
                userId,
                date: selectedDate.toISOString().split('T')[0],
            });
            setLeaveDates([...leaveDates, selectedDate]);
            alert(`Leave added for ${selectedDate.toDateString()}`);
        } catch (error) {
            console.error('Error adding leave:', error.response?.data || error.message);
            alert('Failed to add leave.');
        }
    };

    const markAvailability = async () => {
        if (!startTime || !endTime) {
            alert('Please select both start and end times.');
            return;
        }
        const adjustedDate = new Date(selectedDate);
        adjustedDate.setMinutes(adjustedDate.getMinutes() - adjustedDate.getTimezoneOffset());

        const availabilityData = {
            userId,
            date: adjustedDate.toISOString().split('T')[0],
            start_time: `${startTime.format('hh:mm')} ${startAMPM}`,
            end_time: `${endTime.format('hh:mm')} ${endAMPM}`,
            breaks: breakTimes.map((breakTime) => ({
                start: `${breakTime.start.format('hh:mm')} ${breakTime.startAMPM}`,
                end: `${breakTime.end.format('hh:mm')} ${breakTime.endAMPM}`,
            })),
            duration: consultationDuration,
        };
        console.log('data....' , availabilityData)
        try {
            await api.post(`doctors/availability/`, availabilityData);
            alert('Availability marked successfully!');
        } catch (error) {
            console.error('Error marking availability:', error.response?.data || error.message);
            console.log(error.response)
        }
    };

    const addBreakTime = () => {
        const defaultBreak = {
            start: dayjs(),
            startAMPM: 'AM',
            end: dayjs().add(1, 'hour'),
            endAMPM: 'AM',
        };
        setBreakTimes([...breakTimes, defaultBreak]);
    };

    const updateBreakTime = (index, type, value) => {
        const updatedBreakTimes = [...breakTimes];
        updatedBreakTimes[index][type] = value;
        setBreakTimes(updatedBreakTimes);
    };

    const removeBreakTime = (index) => {
        setBreakTimes(breakTimes.filter((_, i) => i !== index));
    };

    return (
        <div className="appointment-management">
            <h2>Slot Management</h2>

            <div className="appointment-container">
                <div className="calendar-section">
                    <h3>Choose a Date</h3>
                    <Calendar
                        onChange={handleDateClick}
                        value={selectedDate}
                        tileClassName={({ date }) =>
                            leaveDates.some(
                                (leaveDate) =>
                                    leaveDate.toDateString() === date.toDateString()
                            )
                                ? 'leave-date'
                                : ''
                        }
                        tileDisabled={({ date }) => date < new Date().setHours(0, 0, 0, 0)}
                    />
                </div>

                <div className="details-section">
                    <h3>Selected Date: {selectedDate.toDateString()}</h3>

                    <div className="timeclock-section">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <h3>{isSettingStartTime ? 'Set Start Time' : 'Set End Time'}</h3>
                            <TimeClock
                                key={key}
                                value={isSettingStartTime ? startTime : endTime}
                                onChange={handleTimeChange}
                                views={['hours', 'minutes']}
                            />
                            <div className="ampm-selector">
                                <label>Select AM/PM:</label>
                                <select
                                    value={isSettingStartTime ? startAMPM : endAMPM}
                                    onChange={(e) =>
                                        isSettingStartTime
                                            ? setStartAMPM(e.target.value)
                                            : setEndAMPM(e.target.value)
                                    }
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </LocalizationProvider>

                        <div className="timeclock-buttons">
                            <button
                                className={isSettingStartTime ? 'active' : ''}
                                onClick={() => switchTimeSetting(true)}
                            >
                                Set Start Time
                            </button>
                            <button
                                className={!isSettingStartTime ? 'active' : ''}
                                onClick={() => switchTimeSetting(false)}
                            >
                                Set End Time
                            </button>
                        </div>
                        <p>
                            Start Time: {startTime ? `${startTime.format('hh:mm')} ${startAMPM}` : 'Not Set'} <br />
                            End Time: {endTime ? `${endTime.format('hh:mm')} ${endAMPM}` : 'Not Set'}
                        </p>
                        
                    </div>

                    <div className="consultation-section">
                        <h3>Consultation Duration (minutes)</h3>
                        <input
                            type="number"
                            value={consultationDuration}
                            onChange={(e) => setConsultationDuration(Number(e.target.value))}
                            className="consultation-input"
                        />
                    </div>

                    <div className="breaks-section">
                        <h3>Break Times</h3>
                        {breakTimes.map((breakTime, index) => (
                            <div key={index} className="break-time-row">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <div className="time-input">
                                        <h4>Start:</h4>
                                        <TimeClock
                                            value={breakTime.start}
                                            onChange={(time) =>
                                                updateBreakTime(index, 'start', time)
                                            }
                                            views={['hours', 'minutes']}
                                        />
                                        <select
                                            value={breakTime.startAMPM}
                                            onChange={(e) =>
                                                updateBreakTime(index, 'startAMPM', e.target.value)
                                            }
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                    <div className="time-input">
                                        <h4>End:</h4>
                                        <TimeClock
                                            value={breakTime.end}
                                            onChange={(time) =>
                                                updateBreakTime(index, 'end', time)
                                            }
                                            views={['hours', 'minutes']}
                                        />
                                        <select
                                            value={breakTime.endAMPM}
                                            onChange={(e) =>
                                                updateBreakTime(index, 'endAMPM', e.target.value)
                                            }
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </LocalizationProvider>
                                <button
                                    className="remove-break"
                                    onClick={() => removeBreakTime(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button className="add-break" onClick={addBreakTime}>
                            Add Break
                        </button>
                    </div>

                    <div className="actions-section">
                        <button onClick={addLeave} className="action-btn leave-btn">
                            Add Leave
                        </button>
                        <button onClick={markAvailability} className="action-btn availability-btn">
                            Mark Availability
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppointmentManagement;
