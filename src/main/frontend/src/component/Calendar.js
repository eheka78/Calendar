import "./Calendar.css";
import Calendar_detail from "./Calendar_detail";
import assignEventLinesByDay from "./assignEventLinesByDay";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Calendar() {
    const calendarRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);  // Calendar_detail 의 날짜
    let date = new Date();     // 달력에 표시 되는 날짜
    const today = new Date();  // 오늘 날짜
    const [userId, setUserId] = useState('dodam');
    const [event, setEvent] = useState([]);


    // 달력의 한 달 일정을 fetch
    const fetchEvent = async () => {
        // console.log(userId + " " + selectedDate?.getFullYear() + " " + (selectedDate?.getMonth() + 1));
        if(!selectedDate) return;
        if(!userId) return;

        try {
            const response = await axios.get('/api/calendar/' + userId, {
                params: {
                    userId,
                    year: selectedDate?.getFullYear(),
                    month: selectedDate?.getMonth() + 1
                }
            });
            setEvent(response.data);
            // console.log(response.data);
        } catch (e) {
            console.error("fail fetch: ", e);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchEvent();
        }
    }, [selectedDate]);

    useEffect(() => {
        render();
    }, [userId, event]);

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

        const lineMap = assignEventLinesByDay(event, year, month);

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            emptyDiv.classList.add("calendar-day", "empty");
            daysContainer.appendChild(emptyDiv);
        }

        for (let day = 1; day <= lastDate; day++) {
            const key = `${month}-${day}`;
            const lineEvents = lineMap[key] || [];

            const dayDiv = document.createElement("div");
            dayDiv.classList.add("calendar-day", key);

            const dateDiv = document.createElement("div");
            dateDiv.textContent = day;
            dateDiv.classList.add("calendar-day-number");
            dayDiv.appendChild(dateDiv);

            dayDiv.addEventListener("click", () => {
                setSelectedDate(new Date(year, month, day));
            });

            // 하루에 몇 줄? 일지 lineIndex < 4 이걸로 결정
            for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
                const e = lineEvents[lineIndex];

                const dayScheduleDiv = document.createElement("div");
                dayScheduleDiv.style.height = "20px";
                dayScheduleDiv.classList.add("calendar-day-info", `event-line-${lineIndex}`);

                if(e){
                    const eventStartDate = new Date(e.startDateTime);
                    const eventEndDate = new Date(e.endDateTime);

                    if(eventStartDate.getFullYear() === eventEndDate.getFullYear()
                       && eventStartDate.getMonth() === eventEndDate.getMonth()
                       && eventStartDate.getDate() === eventEndDate.getDate()
                       && eventStartDate.getHours() === 0 && eventStartDate.getMinutes() === 0 && eventStartDate.getSeconds() === 0
                       && eventEndDate.getHours() === 23 && eventEndDate.getMinutes() === 59 && eventEndDate.getSeconds() === 59
                    ){
                        dayScheduleDiv.style.backgroundColor = e.color;
                        dayScheduleDiv.style.borderRadius = "5px";
                    }  // 오늘 하루 종일 일정일 때
                    else if (eventStartDate.getMonth() != eventEndDate.getMonth()
                             || eventStartDate.getDate() != eventEndDate.getDate()){
                        if(eventStartDate.getMonth() === month && eventStartDate.getDate() === day){
                            dayScheduleDiv.style.setProperty("border-radius", "5px 0 0 5px");
                        }
                        if(eventEndDate.getMonth() === month && eventEndDate.getDate() === day){
                            dayScheduleDiv.style.setProperty("border-radius", "0 5px 5px 0");
                        }
                        dayScheduleDiv.style.backgroundColor = e.color;
                    }  // 하루 이상의 일정일 때

                    const titleDiv = document.createElement("div");
                    titleDiv.textContent = e.title;
                    titleDiv.style.padding = "0px";
                    titleDiv.style.lineHeight = "20px";

                    const colorDiv = document.createElement("div");
                    if(eventStartDate.getFullYear() === eventEndDate.getFullYear()
                       && eventStartDate.getMonth() === eventEndDate.getMonth()
                       && eventStartDate.getDate() === eventEndDate.getDate()
                       && !(eventStartDate.getHours() === 0 && eventStartDate.getMinutes() === 0 && eventStartDate.getSeconds() === 0
                            && eventEndDate.getHours() === 23 && eventEndDate.getMinutes() === 59 && eventEndDate.getSeconds() === 59)
                    ){
                        colorDiv.style.backgroundColor = e.color;
                    }
                    else{
                        // 보류
                        // titleDiv.style.color = "white";
                    }
                    titleDiv.classList.add("calendar-day-info-title");
                    colorDiv.classList.add("calendar-day-info-color");

                    dayScheduleDiv.appendChild(colorDiv);
                    dayScheduleDiv.appendChild(titleDiv);
                } else {
                    // 빈 줄 유지 (투명한 공백용 div)
                    dayScheduleDiv.style.visibility = "hidden"; // 공간은 차지하되 안 보이게
                }

                dayDiv.appendChild(dayScheduleDiv);
            }

            // 오늘 날짜 표시
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
            <Calendar_detail userId={userId} selectedDate={selectedDate} changeMonth={changeMonth} fetchEvent={fetchEvent}/>
        </div>
    );
}
