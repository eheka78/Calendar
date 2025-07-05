import "./Calendar.css";
import Calendar_detail from "./Calendar_detail";

import React, { useEffect, useRef, useState } from "react";

export default function Calendar() {
    const calendarRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    let date = new Date();
    const today = new Date();
    const [userId, setUserId] = useState('dodam');


    useEffect(() => {
        render();
    }, [userId]);

    useEffect(() => {
        setSelectedDate(today);
    }, [])


    function render() {
        const container = calendarRef.current;
        if (!container) return;

        container.className = "calendar-frame";
        container.innerHTML = "";

        // 헤더 생성
        const header = document.createElement("div");
        header.className = "calendar-header";

        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = "&lt;";
        prevBtn.addEventListener("click", () => changeMonth(-1));

        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = "&gt;";
        nextBtn.addEventListener("click", () => changeMonth(1));

        const title = document.createElement("div");
        title.className = "calendar-title";
        title.textContent = `${date.getFullYear()}. ${date.getMonth() + 1}`;

        const todayBtn = document.createElement("button");
        todayBtn.textContent = "Today";
        todayBtn.className = "calendar-today-button";
        todayBtn.addEventListener("click", () => goToToday());

        const title_todayBtn_div = document.createElement("div");
        title_todayBtn_div.className = "title-todayBtn-div";
        title_todayBtn_div.appendChild(title);
        title_todayBtn_div.appendChild(todayBtn);

        header.appendChild(prevBtn);
        header.appendChild(title_todayBtn_div);
        header.appendChild(nextBtn);
        container.appendChild(header);

        // 요일 헤더 생성
        const weekdays = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"];
        const weekdaysRow = document.createElement("div");
        weekdaysRow.className = "calendar-weekdays";
        weekdays.forEach(day => {
            const dayElement = document.createElement("div");
            dayElement.className = "calendar-weekday";
            dayElement.textContent = day;
            weekdaysRow.appendChild(dayElement);
        });

        const daysContainer = document.createElement("div");
        daysContainer.className = "calendar-days";

        const container_inner = document.createElement("div");
        container_inner.className = "calendar-frame2";
        container_inner.appendChild(weekdaysRow);
        container_inner.appendChild(daysContainer);

        container.appendChild(container_inner);

        renderDays(daysContainer);
    }

    function renderDays(daysContainer) {
        daysContainer.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            emptyDiv.classList.add("calendar-day", "empty");
            daysContainer.appendChild(emptyDiv);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement("div");
            dayDiv.textContent = day;
            dayDiv.classList.add("calendar-day", `${month}-${day}`);

            dayDiv.addEventListener("click", () => {
                setSelectedDate(new Date(year, month, day));
            });

            const dayScheduleDiv1 = document.createElement("div");
            dayScheduleDiv1.classList.add("calendar-day-info");

            const extraInfoTitleDiv1 = document.createElement("div");
            extraInfoTitleDiv1.textContent = "test";
            extraInfoTitleDiv1.classList.add("calendar-day-info-title");

            const extraInfoColorDiv1 = document.createElement("div");
            extraInfoColorDiv1.style.backgroundColor = "#0000ff";
            extraInfoColorDiv1.classList.add("calendar-day-info-color");

            dayScheduleDiv1.appendChild(extraInfoColorDiv1);
            dayScheduleDiv1.appendChild(extraInfoTitleDiv1);
            dayDiv.appendChild(dayScheduleDiv1);

            if (
                year === today.getFullYear() &&
                month === today.getMonth() &&
                day === today.getDate()
            ) {
                dayDiv.classList.add("today");
            }

            daysContainer.appendChild(dayDiv);
        }
    }

    function changeMonth(offset) {
        date.setMonth(date.getMonth() + offset);
        setSelectedDate(null); // 월이 바뀌면 선택 초기화
        render();
    }

    function goToToday() {
        date = new Date(today);
        setSelectedDate(null); // 초기화
        render();
    }

    return (
        <div>
            <div style={{ marginBottom:"20px" }}>
                userId: <input type="text"
                               defaultValue="dodam"
                               onChange={(e) => setUserId(e.target.value)}
                        />
            </div>

            <div ref={calendarRef}></div>
            <Calendar_detail userId={userId} selectedDate={selectedDate} changeMonth={changeMonth}/>
        </div>
    );
}
