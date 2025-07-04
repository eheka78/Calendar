import React, {useState} from "react";
import "./Add_schedule.css";

export default function AddSchedule({ selectedDate, onClose }) {
    const [timeChecked, setTimeChecked] = useState(false);
    const [startTime, setStartTIme] = useState('');

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
                />

                <div style={{height: "20px"}} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 5fr", gap: "10px", textAlign: "left"}}>
                    <div>태그 컬러</div>
                    <div><input type="color" /></div>
                    <div>시간 설정</div>
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
                                       value={startTime}
                                       onChange={(e) => setStartTIme(e.target.value)}
                                />
                                <br />~<br />
                                <input type="datetime-local"
                                       min={startTime}
                                />
                            </div>
                        </>
                    )}
                </div>

                <hr style={{margin: "30px auto"}} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 5fr", gap: "10px", textAlign: "left"}}>
                    <div>반복</div>
                    <div>
                        <select name="routine">
                            <option value="daily">매일</option>
                            <option value="weekly">매주</option>
                            <option value="monthly">매달</option>
                            <option value="yearly">매년</option>
                        </select>
                    </div>
                    <div>메모</div>
                    <div><input type="text" style={{ width: "100%" }} /></div>
                </div>

            </div>

            <br />
            <button style={{marginRight:"10px"}}>저장</button>
        </div>
    );
}
