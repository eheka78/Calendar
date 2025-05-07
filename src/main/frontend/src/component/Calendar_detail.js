// Calendar_detail.js
import React from "react";

export default function Calendar_detail({ selectedDate, changeMonth }) {
    if (!selectedDate) return null;

    return (
            <div className="calendar-detail" style={{ border: "1px solid black"}}>
                <h3 style={{ float: "left" }}>{selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 상세 정보</h3>
                <p style={{ float : "right" }}
                   onClick={ () => changeMonth(0)}>X</p>
                <hr/>
                <p>123</p>
            </div>
    );
}
