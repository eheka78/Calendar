import "./Calendar_detail.css";
import AddSchedule from "./Add_schedule"; // add_schedule.js 컴포넌트 import
import EditSchedule from "./Edit_schedule"; // add_schedule.js 컴포넌트 import

import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function Calendar_detail({ userId, selectedDate, changeMonth, fetchEvent }) {
    const [showAddSchedule, setShowAddSchedule] = useState(false); // 상태 추가
    const [showEditSchedule, setShowEditSchedule] = useState(false); // 상태 추가
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [editEvent, setEditEvent] = useState('');


    const formatDate = (date) =>
            date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : null;

    const fetchOneDayEventDetail = async () => {
        if (!selectedDate) return;

        try {
            const response = await axios.get('/api/calendar/event/' + userId, {
                params: {
                    userId,
                    date: formatDate(selectedDate)
                }
            });

            console.log(response.data);
            setSelectedDateEvents(response.data);
        } catch (e) {
            console.error("fail fetch: ", e);
        }
    };

    const deleteEvent = async (eventId) => {
        if (!selectedDate) return;

        try {
            const response = await axios.delete('/api/calendar/' + eventId);

            alert(response.message);

            fetchOneDayEventDetail();
            fetchEvent();
        } catch (e) {
            console.error("fail fetch: ", e);
        }
    };

    function formatDateTime(dateStr) {
        const date = new Date(dateStr);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${y}-${m}-${d} ${h}:${min}`;
    }

    useEffect (() => {
        fetchOneDayEventDetail();
        fetchEvent();
    }, [selectedDate, showAddSchedule, showEditSchedule]);


    return (
        <div>
        {!selectedDate ? (
            <div></div>
        ) : (
            <div className="calendar-day-detail">
                <div style={{ width: "90%", margin: "auto" }}>
                    <h3 style={{ float: "left", margin: "10px 0px"  }}>
                        {selectedDate.getFullYear()} - {selectedDate.getMonth() + 1} - {selectedDate.getDate()}
                    </h3>
                    <p
                        style={{ float: "right", verticalAlign: "middle", margin: "10px 0px" }}
                        onClick={() => changeMonth(0)}
                    >
                        X
                    </p>

                    <div style={{ clear: "both" }} />

                    <hr style={{margin: "0 0 15px 0px"}} />

                    <div className="calendar-day-detail-group">
                    {selectedDateEvents.map((e) => (
                        <div key={e.id}
                             style={{ display: "grid",
                                      gridTemplateColumns: "20px 2fr 6fr 20px",
                                      gap: "5px",
                                      textAlign: "left",
                                      marginBottom: "10px", // 구분용
                             }}
                        >
                            <div className="item"
                                 style={{ width: "20px",
                                          height: "60px",
                                          backgroundColor: e.color
                                 }}
                            >
                            </div>
                            <div className="item" style={{ fontWeight: "bold" }}>{e.title}</div>
                            <div className="item" style={{ color: "gray" }}>{formatDateTime(e.startDateTime)} ~ {formatDateTime(e.endDateTime)}</div>
                            <div className="item setting-wrapper" style={{ color: "gray" }}>
                                <span>...</span>
                                <ul className="setting">
                                    <li onClick={() => { setShowEditSchedule(true);
                                                         setEditEvent(e);
                                    }}>edit</li>
                                    <li onClick={() => deleteEvent(e.id)}>delete</li>
                                </ul>
                            </div>

                            <div className="item" style={{ color: "gray" }}>{e.memo}</div>
                        </div>
                    ))}
                    </div>


                    <div
                        style={{ float: "right", fontSize: "30px", cursor: "pointer" }}
                        onClick={() => setShowAddSchedule(true)}
                    >
                        +
                    </div>
                    <div style={{ clear: "both" }} />

                    {/* 조건부 렌더링 */}
                    {showAddSchedule && (
                        <AddSchedule selectedDate={selectedDate}
                                     onClose={() => setShowAddSchedule(false)}
                                     userId={userId}
                        />
                    )}


                    {/* 조건부 렌더링 */}
                    {showEditSchedule && (
                        <EditSchedule
                            selectedDate={selectedDate}
                            onClose={() => setShowEditSchedule(false)}
                            userId={userId}
                            editEvent={editEvent}
                        />
                    )}
                </div>

            </div>
        )}
        </div>
    );
}
