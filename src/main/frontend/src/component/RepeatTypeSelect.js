import React, {useEffect, useState} from "react";

export default function RepeatTypeSelect ({ eventStartDateTime, eventEndDateTime, eventRepeat, setEventRepeat }) {
    console.log(eventStartDateTime, eventEndDateTime);
    console.log("repeat: " + eventRepeat);

    const dateDiff = (eventEndDateTime - eventStartDateTime) / (259200000 / 3);
    console.log("dateDiff: " + dateDiff);

    const isDailyBlock = (dateDiff > 1);
    const isWeeklyBlock = (dateDiff > 7);
    const isMonthlyBlock = (dateDiff > 30);
    const isYearlyBlock = (dateDiff > 365);


    useEffect(() => {
        setEventRepeat ("none");
    }, [])


    return (
        <div>
            <select name="routine"
                    onChange={(e) => setEventRepeat(e.target.value)}
            >
                <option value="none" key="none" default>none</option>
                <option value="daily" key="daily" disabled={isDailyBlock || !dateDiff || dateDiff === 0}>매일</option>
                <option value="weekly" key="weekly" disabled={isWeeklyBlock || !dateDiff || dateDiff === 0}>매주</option>
                <option value="monthly" key="monthly" disabled={isMonthlyBlock || !dateDiff || dateDiff === 0}>매달</option>
                <option value="yearly" key="yearly" disabled={isYearlyBlock || !dateDiff || dateDiff === 0}>매년</option>
            </select>
        </div>
    );
}