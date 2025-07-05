import RepeatTypeSelect from './RepeatTypeSelect';
import "./Add_schedule.css";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AddSchedule({ selectedDate, onClose, userId }) {
    const [timeChecked, setTimeChecked] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventColor, setEventColor] = useState("#0000FF");
    const [eventMemo, setEventMemo] = useState('');
    const [eventStartDateTime, setEventStartDateTime] = useState('');
    const [eventEndDateTime, setEventEndDateTime] = useState('');
    const [eventRepeat, setEventRepeat] = useState('none');
    const [eventRepeatEndDateTime, setEventRepeatEndDateTime] = useState('');


    useEffect(() => {
        setEventRepeatEndDateTime('');
        document.getElementById('repeatEndDateInput').value = '';
    }, [eventRepeat]);

    // eventStartDateTime, eventEndDateTime 제대로 변경됐는지 확인하는 로그
    useEffect(() => {
        console.log("✅ 변경된 값:", eventStartDateTime, eventEndDateTime);
    }, [eventStartDateTime, eventEndDateTime]);

    useEffect(() => {
        if (!selectedDate) return;
        console.log("timeChecked: " + timeChecked + " / selectedDate: " + selectedDate);

        if(!timeChecked && selectedDate){
            const tempDate1 = new Date(selectedDate);
            tempDate1.setHours(0, 0, 0, 0);
            console.log("tempDate1: " + tempDate1);

            const tempDate2 = new Date(selectedDate);
            tempDate2.setHours(23, 59, 59, 999);
            console.log("tempDate2: " + tempDate2);


            setEventStartDateTime(tempDate1);
            setEventEndDateTime(tempDate2);
        }
        else{
            setEventStartDateTime(formatDate3(selectedDate));
            setEventEndDateTime(formatDate3Plus1Hour(selectedDate));
        }

    }, [timeChecked, selectedDate])

    useEffect(() => {
        console.log("eventRepeatEndDateTime: " + eventRepeatEndDateTime);
    }, [eventRepeatEndDateTime])

    // 해당 날짜를 min에 맞게 수정.
    const formatDate = (date) =>
        date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : null;

    const formatTime = (date) =>
        date ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}` : null;

    const formatDate2 = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;  // 유효하지 않은 날짜일 경우 처리
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    // Date로 감싸기
    const formatDate3 = (date) => {
        if(!date) return null;

        const d = new Date(date);

        console.log("formatDate3: " + d);
        return d;
    }

    const formatDate3Plus1Hour = (date) => {
        if(!date) return null;

        const d = new Date(date);
        d.setTime(d.getTime() + 60 * 1000 * 60);

        console.log("formatDate3Plus1Hour: " + d);
        return d;
    }

    // input type : datetime-local min 정할 때 필요한 포맷
    const formatDate4 = (date) => {
        if (!date) return null;

        const d = new Date(date);
        if (isNaN(d.getTime())) return null;

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    const formatDate4Plus1Hour = (date) => {
        if (!date) return null;

        const d = new Date(date);
        d.setTime(d.getTime() + 60 * 1000 * 60); // 한 시간 더함

        // ⬇️ 이걸 추가해서 포맷까지 적용
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    // 해당 날짜를 반복 했을 때 max date를 구하기
    const RepeatEndDateRange = (date) => {
        if (!date) return undefined;

        const tempDate = new Date(date);

        if(eventRepeat === "daily"){
            tempDate.setDate(tempDate.getDate() + 31);
        }
        else if(eventRepeat === "weekly"){
            tempDate.setDate(tempDate.getDate() + (31 * 3));
        }
        else if(eventRepeat === "monthly"){
            tempDate.setDate(tempDate.getDate() + (31 * 12));
        }
        else if(eventRepeat === "yearly"){
            tempDate.setDate(tempDate.getDate() + (31 * 12 * 3));
        }

        return tempDate;
    }

    // 일정 추가
    const addEvent = async () => {
        console.log("addEvent: " + userId + " " +  timeChecked  + " " + eventStartDateTime + " "
                + eventEndDateTime+ " " + eventTitle + " " + eventRepeat + " " + eventRepeatEndDateTime);
        try {
            const response = await axios.post('/api/calendar', {
                userId: userId,
                title: eventTitle,
                color: eventColor,
                memo: eventMemo,

                startDate: formatDate(eventStartDateTime),
                startTime: formatTime(eventStartDateTime),

                endDate: formatDate(eventEndDateTime),
                endTime: formatTime(eventEndDateTime),

                repeat: eventRepeat,
                repeatEndDate: formatDate(eventRepeatEndDateTime),
                repeatEndTime: formatTime(eventRepeatEndDateTime)
            });


            if(response.data.success){
                alert(response.data.message);
            }else {
                alert("response error");
            }
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className="Add_schedule" style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>

            <div style={{ margin: "20px" }}>
                <button onClick={onClose}
                        style={{ float: "right",
                                 marginBottom: "15px"
                        }}
                >X</button>

                <div style={{float: "none"}} />
                <input type="text"
                       placeholder="일정 제목"
                       style={{ width: "98%",
                                padding: "10px 5px",
                                fontSize: "30px",
                                border: "none",
                                outline: "none"
                       }}
                       onChange={(e) => setEventTitle(e.target.value)}
                />

                <div style={{height: "20px"}} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 5fr", gap: "10px", textAlign: "left"}}>
                    <div>태그 컬러</div>
                    <div>
                        <input type="color"
                               defaultValue="#0000FF"
                               onChange={(e) => setEventColor(e.target.value)}
                        />
                    </div>
                    <div>기간 설정</div>
                    <div>
                        <input type="checkbox"
                               style={{width:"20px", height:"20px"}}
                               onChange={(e) => setTimeChecked(e.target.checked)}
                        />
                    </div>

                    {timeChecked && (
                        <>
                            <div />
                            <div>
                                <input type="datetime-local"
                                       defaultValue={formatDate4(selectedDate)}
                                       onChange={(e) => setEventStartDateTime(formatDate3(e.target.value))}
                                />
                                <br />~<br />
                                <input type="datetime-local"
                                       min={formatDate4(eventStartDateTime)}
                                       defaultValue={formatDate4Plus1Hour(selectedDate)}
                                       onChange={(e) => setEventEndDateTime(formatDate3(e.target.value))}
                                />
                            </div>
                        </>
                    )}
                </div>

                <hr style={{margin: "30px auto"}} />


                <div style={{ display: "grid", gridTemplateColumns: "1fr 5fr", gap: "10px", textAlign: "left"}}>
                    <div>반복</div>
                    <div>
                        <RepeatTypeSelect eventStartDateTime={eventStartDateTime} eventEndDateTime={eventEndDateTime}
                                          eventRepeat={eventRepeat} setEventRepeat={setEventRepeat}
                        />
                    </div>


                    <div>반복 end</div>
                    <div>
                        <input id="repeatEndDateInput"
                               type="date"
                               min={formatDate2(eventEndDateTime)}
                               max={formatDate2(RepeatEndDateRange(eventStartDateTime))}
                               disabled={eventRepeat === "none"}

                               onChange={(e) => setEventRepeatEndDateTime(formatDate3(e.target.value))}
                        />
                    </div>


                    <div>메모</div>
                    <div>
                        <input type="text"
                               style={{ width: "100%" }}
                               onchange={(e) => setEventMemo(e.target.value)}
                        />
                    </div>
                </div>

            </div>

            <br />
            <button style={{marginRight:"10px"}}
                    onClick={addEvent}
            >저장</button>
        </div>
    );
}
