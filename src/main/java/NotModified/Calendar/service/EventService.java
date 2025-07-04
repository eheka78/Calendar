package NotModified.Calendar.service;

import NotModified.Calendar.domain.Event;
import NotModified.Calendar.dto.event.EventCreateRequest;
import NotModified.Calendar.dto.event.EventResponse;
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
import java.util.stream.Stream;

@Service
@Transactional
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // repeatEndDateTime이 null이면, startDateTime + 5년으로 자동 저장
    public Long registerEvent(EventCreateRequest dto) {

        // startDateTime < endDateTime이면 저장 실패
        if(dto.getStartDate().isAfter(dto.getEndDate())) {
            return -1L;
        }

        Event newEvent = Event.builder()
                .userId(dto.getUserId())
                .title(dto.getTitle())
                .color(dto.getColor())
                .memo(dto.getMemo())
                .startDate(dto.getStartDate())
                .startTime(dto.getStartTime())
                .endDate(dto.getEndDate())
                .endTime(dto.getEndTime())
                .repeat(dto.getRepeat())
                .repeatEndDate(dto.getRepeatEndDate())
                .repeatEndTime(dto.getRepeatEndTime())
                .build();

        // Q. 종료 날짜를 설정안할 수도 있나??

        // 반복 종료일을 설정하지 않으면 시작일로부터 5년 뒤로 자동 설정
        if(dto.getRepeat() != null && !dto.getRepeat().equals("none") && dto.getRepeatEndDate() == null) {
            newEvent.setRepeatEndDate(dto.getStartDate().plusYears(5));
            newEvent.setRepeatEndTime(dto.getStartTime());
        }

        eventRepository.save(newEvent);
        return newEvent.getId();
    }

    // 특정날짜가 하나의 반복 일정 인스턴스에 포함되는지 판단하는 함수
    private boolean isInRepeatInstance(LocalDate rangeStart, LocalDate rangeEnd, Event e) {
        // rangeStart ~ rangeEnd 의 날짜 조회
        // 조회 날짜가 시작 날짜보다 전이면 pass
        if(rangeEnd.isBefore(e.getStartDate())) return false;

        // 조회 날짜가 반복 종료 날짜보다 이후면 pass
        if(e.getRepeatEndDate() != null && rangeStart.isAfter(e.getRepeatEndDate()))
            return false;

        // 특정 반복 일정의 (시작 날짜 ~ 종료 날짜)
        LocalDate start = e.getStartDate();
        LocalDate end = e.getEndDate() != null ? e.getEndDate() : start;
        // duration = 총 몇 일짜리 일정인지
        long duration = ChronoUnit.DAYS.between(start,end);

        return switch (e.getRepeat()) {
            case "daily" -> {
                // start 날짜와 rangeStart가 얼마나 떨어져 있는지(몇일만큼) 계산
                long days = ChronoUnit.DAYS.between(start, rangeStart);
                // instanceStart, instanceEnd : days 만큼 시작 날짜를 옮기고 종료 날짜는 duration 만큼 띄움
                LocalDate instStart = start.plusDays(days);
                LocalDate instEnd = instStart.plusDays(duration);
                yield !instStart.isAfter(rangeEnd) && !instEnd.isBefore(rangeStart);
            }

            case "weekly" -> {
                // 몇 주만큼 떨어져 있는지 계산
                long weeks = ChronoUnit.WEEKS.between(start, rangeStart);
                LocalDate instStart = start.plusWeeks(weeks);
                LocalDate instEnd = instStart.plusDays(duration);
                yield !instStart.isAfter(rangeEnd) && !instEnd.isBefore(rangeStart);
            }
            case "monthly" -> {
                long months = ChronoUnit.MONTHS.between(YearMonth.from(start), YearMonth.from(rangeStart));
                LocalDate instStart = start.plusMonths(months);
                LocalDate instEnd = instStart.plusDays(duration);
                yield !instStart.isAfter(rangeEnd) && !instEnd.isBefore(rangeStart);
            }

            case "yearly" -> {
                long years = rangeStart.getYear() - start.getYear();
                LocalDate instStart = start.plusYears(years);
                LocalDate instEnd = instStart.plusDays(duration);
                yield !instStart.isAfter(rangeEnd) && !instEnd.isBefore(rangeStart);
            }
            default -> false;
        };
    }

    private List<EventResponse> generateRepeatInstances(LocalDate rangeStart, LocalDate rangeEnd, Event e) {
        List<EventResponse> instances = new ArrayList<>();

        LocalDate start = e.getStartDate();
        LocalDate end = e.getEndDate();
        long duration = ChronoUnit.DAYS.between(start, end);
        LocalDate repeatUntil = e.getRepeatEndDate();

        LocalDate instDate = switch (e.getRepeat()) {
            case "daily" -> start.plusDays(Math.max(0, ChronoUnit.DAYS.between(start, rangeStart)));
            case "weekly" -> start.plusWeeks(Math.max(0, ChronoUnit.WEEKS.between(start, rangeStart)));
            case "monthly" -> start.plusMonths(Math.max(0, ChronoUnit.MONTHS.between(YearMonth.from(start), YearMonth.from(rangeStart))));
            case "yearly" -> start.plusYears(Math.max(0, rangeStart.getYear() - start.getYear()));
            default -> start;
        };

        while (!instDate.isAfter(rangeEnd) && !instDate.isAfter(repeatUntil)) {
            LocalDate instEnd = instDate.plusDays(duration);

            if (!instEnd.isBefore(rangeStart)) {
                LocalDateTime instStartDT = LocalDateTime.of(instDate, e.getStartTime());
                LocalDateTime instEndDT = LocalDateTime.of(instEnd, e.getEndTime());

                instances.add(new EventResponse(
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
        List<EventResponse> repeatInstacnes = eventRepository.findRepeatEvents(userId).stream()
                .flatMap(e -> generateRepeatInstances(rangeStart, rangeEnd, e).stream())
                .toList();

        return Stream.concat(singles.stream(), repeatInstacnes.stream()).toList();
    }
}
