export default function assignEventLinesByDay(events, year, month) {
    const lastDate = new Date(year, month + 1, 0).getDate();
    const lineByDay = {};  // key: "7-8" => value: [eventId or null, ...]
    const prevDayLineMap = {}; // 전날 줄 번호 확인용

    const dayToEvents = Array.from({ length: lastDate + 1 }, () => []);

    // 1. 날짜별로 어떤 이벤트가 포함되는지 정리
    events.forEach((e) => {
        const start = new Date(e.startDateTime);
        const end = new Date(e.endDateTime);

        for (let d = start.getDate(); d <= end.getDate(); d++) {
            if (start.getFullYear() === year && start.getMonth() === month) {
                dayToEvents[d].push(e);
            }
        }
    });

    // 2. 날짜별 줄 할당
    for (let day = 1; day <= lastDate; day++) {
        const key = `${month}-${day}`;
        const lines = Array(10).fill(null);  // 최대 5줄 가정
        const todayEvents = dayToEvents[day];
        const assignedIds = new Set();

        // console.log(day);

        // 전날 줄 유지
        if (lineByDay[`${month}-${day - 1}`]) {
            const prev = lineByDay[`${month}-${day - 1}`];
            prev.forEach((event, i) => {
                if (!event) return;
                const e = events.find(ev => ev.id === event.id);

                const end = new Date(e.endDateTime);
                if (end.getDate() >= day) {
                    lines[i] = { ...e };
                    assignedIds.add(e.id);
                }
            });
        }

        // console.log(lines);

        // 남은 이벤트 줄 할당
        for (const e of todayEvents) {
            if (assignedIds.has(e.id)) continue;

            for (let i = 0; i < lines.length; i++) {
                if (!lines[i]) {
                    lines[i] = { ...e };
                    assignedIds.add(e.id);
                    break;
                }
            }
        }

        lineByDay[key] = lines;
    }

    return lineByDay;
}
