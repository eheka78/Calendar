import React, { useState } from "react";
import "./Calendar_detail.css";
import AddSchedule from "./Add_schedule"; // add_schedule.js 컴포넌트 import

export default function Calendar_detail({ selectedDate, changeMonth }) {
    const [showAddSchedule, setShowAddSchedule] = useState(false); // 상태 추가

    if (!selectedDate) return null;

    return (
        <div className="calendar-day-detail">
            <div style={{ width: "90%", margin: "auto" }}>
                <h3 style={{ float: "left" }}>
                    {selectedDate.getFullYear()} - {selectedDate.getMonth() + 1} - {selectedDate.getDate()}
                </h3>
                <p
                    style={{ float: "right", verticalAlign: "middle" }}
                    onClick={() => changeMonth(0)}
                >
                    X
                </p>

                <div style={{ clear: "both" }} />

                <hr />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "20px 2fr 6fr 20px",
                        gap: "5px",
                        textAlign: "left",
                    }}
                >
                    <div className="item" style={{ width: "20px", height: "60px", backgroundColor: "blue" }}></div>
                    <div className="item" style={{ fontWeight: "bold" }}>야구 직관 width 도도</div>
                    <div className="item" style={{ color: "gray" }}>17:00 ~ 21:00</div>
                    <div className="item" style={{ color: "gray" }}>...</div>
                    <div className="item" style={{ color: "gray" }}>도도랑 야구 직관~~~ 오랜만임.</div>
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
                    <AddSchedule
                        selectedDate={selectedDate}
                        onClose={() => setShowAddSchedule(false)}
                    />
                )}
            </div>
        </div>
    );
}
