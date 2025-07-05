package NotModified.Calendar.service;

import NotModified.Calendar.domain.Event;
import NotModified.Calendar.dto.event.EventCreateRequest;
import NotModified.Calendar.dto.event.EventResponse;
import NotModified.Calendar.dto.event.EventUpdateRequest;
import NotModified.Calendar.repository.interfaces.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // repeatEndDateTime이 null이면, startDateTime + 5년으로 자동 저장
    public Long registerEvent(EventCreateRequest dto) {

        LocalDate startDate = dto.getStartDate();
        LocalDate endDate = dto.getEndDate();
        LocalTime startTime = dto.getStartTime() != null ? dto.getStartTime() : LocalTime.of(0, 0);
        LocalTime endTime = dto.getEndTime() != null ? dto.getEndTime() : LocalTime.of(23, 59);

        // startDate > endDate이면 저장 실패
        if(startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("시작일은 종료일보다 이후일 수 없습니다.");
        }

        // 같은 날짜에서 시작 시간이 종료 시간보다 이후인 경우 저장 실패
        if (startDate.isEqual(endDate) && startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("같은 날에는 시작 시간이 종료 시간보다 빨라야 합니다.");
        }

        Event newEvent = Event.builder()
                .userId(dto.getUserId())
                .title(dto.getTitle())
                .color(dto.getColor())
                .memo(dto.getMemo())
                .startDate(startDate)
                .startTime(startTime)
                .endDate(endDate)
                .endTime(endTime)
                .repeat(dto.getRepeat())
                .repeatEndDate(dto.getRepeatEndDate())
                .repeatEndTime(dto.getRepeatEndTime())
                .build();

        long duration = ChronoUnit.DAYS.between(startDate, endDate);
        String repeat = dto.getRepeat();

        // 반복 주기는 일정 길이보다 길게 설정해야 함
        if(repeat != null) {
            switch (repeat) {
                case "daily" -> {
                    if(duration >= 1)
                        throw new IllegalArgumentException("일일 반복은 1일 이하 일정만 가능합니다.");
                }
                case "weekly" -> {
                    if(duration >= 7)
                        throw new IllegalArgumentException("주간 반복은 7일 이하 일정만 가능합니다.");
                }
                case "monthly" -> {
                    if(duration >= 28)
                        throw new IllegalArgumentException("월간 반복은 28일 이하 일정만 가능합니다.");
                }
                case "yearly" -> {
                    if(duration >= 366)
                        throw new IllegalArgumentException("연간 반복은 1년 미만 일정만 가능합니다.");
                }
            }
        }

        // 반복 종료일을 설정하지 않으면 시작일로부터 5년 뒤로 자동 설정
        if(repeat != null && !repeat.equals("none") && dto.getRepeatEndDate() == null) {
            newEvent.setRepeatEndDate(startDate.plusYears(5));
            newEvent.setRepeatEndTime(startTime);
        }

        eventRepository.save(newEvent);
        return newEvent.getId();
    }

    private List<EventResponse> generateRepeatInstances(LocalDate rangeStart, LocalDate rangeEnd, Event e) {
        List<EventResponse> instances = new ArrayList<>();

        // 반복일정의 시작일
        LocalDate start = e.getStartDate();
        // 반복일정의 종료일 (!= 반복 종료날짜)
        LocalDate end = e.getEndDate();
        long duration = ChronoUnit.DAYS.between(start, end);
        // 반복 종료일
        LocalDate repeatUntil = e.getRepeatEndDate();

        // 첫 번째 반복 instance 날짜 계산 : 기준이 될 날짜 -> 반복일정의 startDate 기준
        LocalDate instDate = switch (e.getRepeat()) {
            // start 와 rangeStart 를 비교해서, 둘 사이의 day 차이가 음수이면 0을, 양수이면 그 차이만큼 start 에 더함
            case "daily" -> start.plusDays(Math.max(0, ChronoUnit.DAYS.between(start, rangeStart)));
            case "weekly" -> start.plusWeeks(Math.max(0, ChronoUnit.WEEKS.between(start, rangeStart)));
            case "monthly" -> start.plusMonths(Math.max(0, ChronoUnit.MONTHS.between(YearMonth.from(start), YearMonth.from(rangeStart))));
            case "yearly" -> start.plusYears(Math.max(0, rangeStart.getYear() - start.getYear()));
            default -> start;
        };

        // rangeStart (instDate ~ instEnd) rangeEnd
        // 반복 instance 의 시작 날짜가 주어진 범위를 벗어나지 않고, 반복 종료날짜 내에 존재하는 경우 계속 반복
        while (!instDate.isAfter(rangeEnd) && !instDate.isAfter(repeatUntil)) {
            LocalDate instEnd = instDate.plusDays(duration);

            // 반복 instance 의 종료 날짜가 주어진 범위의 시작 날짜보다 이후인 경우 response 배열에 추가
            // 주어진 범위의 시작 날짜보다 이전인 경우에는 더 이후의 반복 일정 탐색
            if (!instEnd.isBefore(rangeStart)) {
                LocalDateTime instStartDT = LocalDateTime.of(instDate, e.getStartTime());
                LocalDateTime instEndDT = LocalDateTime.of(instEnd, e.getEndTime());

                instances.add(new EventResponse(
                        e.getId(),
                        e.getTitle(),
                        e.getColor(),
                        e.getMemo(),
                        instStartDT,
                        instEndDT,
                        e.getRepeat(),
                        (e.getRepeatEndDate() != null && e.getRepeatEndTime() != null)
                                ? LocalDateTime.of(e.getRepeatEndDate(), e.getRepeatEndTime())
                                : null
                ));

            }

            // 다음 반복 일자 계산
            instDate = switch (e.getRepeat()) {
                case "daily" -> instDate.plusDays(1);
                case "weekly" -> instDate.plusWeeks(1);
                case "monthly" -> instDate.plusMonths(1);
                case "yearly" -> instDate.plusYears(1);
                default -> repeatUntil.plusDays(1); // 종료 유도
            };
        }

        return instances;
    }

    // 특정 날짜에 해당하는 일정 조회
    public List<EventResponse> findByDate (String userId, LocalDate date) {
        // 단일 일정 조회
        List<Event> singles = eventRepository.findSingleEventsByDate(userId, date);
        List<EventResponse> singleResponses = singles.stream()
                .map(EventResponse::from)
                .toList();

        // 반복 일정 조회 후 해당 날짜의 인스턴스만 추출
        List<Event> repeats = eventRepository.findRepeatEvents(userId);
        List<EventResponse> repeatResponses = repeats.stream()
                .flatMap(e -> generateRepeatInstances(date, date, e).stream()) // 하루짜리 범위
                .toList();

        return Stream.concat(singleResponses.stream(), repeatResponses.stream()).toList();
    }

    public List<EventResponse> findByYearAndMonth(String userId, Long year, Long month) {
        // year-month-01 ~ year-month-31
        LocalDate rangeStart = LocalDate.of(year.intValue(), month.intValue(), 1);
        LocalDate rangeEnd = rangeStart.withDayOfMonth(rangeStart.lengthOfMonth());

        List<EventResponse> singles = eventRepository.findSingleEventsByYearAndMonth(userId, year, month).stream()
                .map(EventResponse::from)
                .toList();

        // 반복 일정 조회
        List<EventResponse> repeatInstances = eventRepository.findRepeatEvents(userId).stream()
                .flatMap(e -> generateRepeatInstances(rangeStart, rangeEnd, e).stream())
                .toList();

        return Stream.concat(singles.stream(), repeatInstances.stream()).toList();
    }

    public Long updateEventById(Long id, Map<String, Object> updates) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 일정입니다."));

        // 기존 값 읽어오기
        LocalDate startDate = event.getStartDate();
        LocalDate endDate = event.getEndDate();
        LocalTime startTime = event.getStartTime();
        LocalTime endTime = event.getEndTime();

        // 변경 요청이 들어온 값이 있으면 업데이트용 임시 변수로 대체
        if(updates.containsKey("startDate")) {
            startDate = LocalDate.parse((String) updates.get("startDate"));
        }
        if(updates.containsKey("endDate")) {
            endDate = LocalDate.parse((String) updates.get("endDate"));
        }
        if(updates.containsKey("startTime")) {
            startTime = LocalTime.parse((String) updates.get("startTime"));
        }
        if(updates.containsKey("endTime")) {
            endTime = LocalTime.parse((String) updates.get("endTime"));
        }

        // 시작일, 종료일 및 시작 시간, 종료 시간에 대한 유효성 검사
        if(startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("시작일은 종료일보다 이후일 수 없습니다.");
        }
        if(startDate.equals(endDate) && startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("같은 날에는 시작 시간이 종료 시간보다 빨라야 합니다.");
        }

        // 반복 설정을 바꾸는 경우, 반복주기가 일정보다 긴지 체크해야 함
        if (updates.containsKey("repeat")) {
            // 일정 길이
            long duration = ChronoUnit.DAYS.between(startDate, endDate);
            switch ((String) updates.get("repeat")) {
                case "daily" -> {
                    if(duration >= 1)
                        throw new IllegalArgumentException("일일 반복은 1일 이하 일정만 가능합니다.");
                }
                case "weekly" -> {
                    if(duration >= 7)
                        throw new IllegalArgumentException("주간 반복은 7일 이하 일정만 가능합니다.");
                }
                case "monthly" -> {
                    if(duration >= 28)
                        throw new IllegalArgumentException("월간 반복은 28일 이하 일정만 가능합니다.");
                }
                case "yearly" -> {
                    if(duration >= 366)
                        throw new IllegalArgumentException("연간 반복은 1년 미만 일정만 가능합니다.");
                }
            }
        }

        // (key, value) pair 를 순회하면서 각 값이 존재하는 경우 update
        for(String key : updates.keySet()) {
            Object value = updates.get(key);
            switch (key) {
                case "title" -> event.setTitle((String) value);
                case "color" -> event.setColor((String) value);
                case "memo" -> event.setMemo((String) value);
                case "startDate" -> event.setStartDate(startDate);
                case "endDate" -> event.setEndDate(endDate);
                case "startTime" -> event.setStartTime(startTime);
                case "endTime" -> event.setEndTime(endTime);
                case "repeat" -> event.setRepeat((String) value);
                case "repeatEndDate" -> event.setRepeatEndDate(LocalDate.parse((String) value));
                case "repeatEndTime" -> event.setRepeatEndTime(LocalTime.parse((String) value));
            }
        }
        
        return id;
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 일정입니다."));
        eventRepository.delete(event);
    }
}
